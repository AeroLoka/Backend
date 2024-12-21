const { PrismaClient } = require('@prisma/client');
const { bookingSchema } = require('../validations/transactionValidation');
const { generateUniqueBookingCode } = require('../utils/generateRandomCode');
const { createPayment } = require('../services/payment');
const prisma = new PrismaClient();
const midtransClient = require('midtrans-client');
const { notificationService } = require('../services/notificationService');


const createBooking = async (req, res) => {
  const { email, flightId, totalPrice, passengers, seats } = req.body;
  const { error } = bookingSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: 400, message: error.details[0].message, data: null });
  }

  try {
    let currentSeats = await prisma.seat.findMany({
      where: { flightId, seatNumber: { in: seats } },
    });

    const existingSeatNumbers = currentSeats.map((seat) => seat.seatNumber);
    const missingSeats = seats.filter((seatNum) => !existingSeatNumbers.includes(seatNum));

    if (missingSeats.length > 0) {
      const newSeats = await Promise.all(
        missingSeats.map((seatNumber) =>
          prisma.seat.create({
            data: { flightId, seatNumber, status: 'available' },
          })
        )
      );
      currentSeats = [...currentSeats, ...newSeats];
    }

    const bookedSeats = currentSeats.filter((seat) => seat.status === 'booked');
    if (bookedSeats.length > 0) {
      return res.status(400).json({
        status: 400,
        message: `Seats ${bookedSeats.map((s) => s.seatNumber).join(', ')} are already booked`,
        data: null,
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found', data: null });
    }

    const bookingCode = await generateUniqueBookingCode(prisma);
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        flightId,
        totalPrice,
        bookingDate: new Date(),
        totalPassenger: passengers.length,
        status: 'unpaid',
        bookingCode,
      },
    });

    const createdPassengers = await Promise.all(
      passengers.map((passenger) =>
        prisma.passenger.create({
          data: {
            firstName: passenger.firstName,
            lastName: passenger.lastName || null,
            birthDate: new Date(passenger.birthDate),
            nationality: passenger.nationality,
            ktpNumber: passenger.ktpNumber || null,
            passportCountry: passenger.passportCountry || null,
            passportNumber: passenger.passportNumber || null,
            passportExpiry: passenger.passportExpiry ? new Date(passenger.passportExpiry) : null,
          },
        })
      )
    );

    const updatedSeatsAndBookings = await Promise.all(
      currentSeats.map(async (seat, index) => {
        try {
          const updatedSeat = await prisma.seat.update({
            where: { id: seat.id, status: 'available', version: seat.version },
            data: {
              version: {
                increment: 1,
              },
            },
          });

          await prisma.bookingPassenger.create({
            data: {
              bookingId: booking.id,
              passengerId: createdPassengers[index].id,
              seatId: updatedSeat.id,
            },
          });

          return updatedSeat;
        } catch (error) {
          if (error.code === 'P2025') {
            throw new Error(`Seat ${seat.seatNumber} was modified by another transaction`);
          }
          throw error;
        }
      })
    );

    const seatVersionCheck = await prisma.seat.findMany({
      where: {
        id: { in: updatedSeatsAndBookings.map((seat) => seat.id) },
      },
    });

    const versionMismatch = seatVersionCheck.some((currentSeat) => {
      const originalSeat = updatedSeatsAndBookings.find((s) => s.id === currentSeat.id);
      return originalSeat.version !== currentSeat.version;
    });

    if (versionMismatch) {
      return res.status(400).json({
        status: 400,
        message: 'Seat version mismatch detected after updates',
        data: null,
      });
    }

    const { token, redirect_url } = await createPayment({
      booking,
      user,
      passengers: createdPassengers,
      seats: updatedSeatsAndBookings,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { snap_token: token },
    });

    const bookingDetail = {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      bookingId: booking.id,
      totalPrice,
      bookingStatus: booking.status,
      bookingCode: booking.bookingCode,
      bookingDate: booking.bookingDate,
      totalPassenger: passengers.length,
      seats: updatedSeatsAndBookings.map((s) => s.seatNumber),
      passengers: createdPassengers,
    };

    const notification = await notificationService({
      email: user.email,
      type: 'Notifikasi',
      title: 'New Booking',
      detail: `You have a new booking with booking code ${booking.bookingCode}`,
      detailMessage: bookingDetail,
    })

    return res.status(201).json({
      status: 201,
      message: 'Booking created successfully',
      data: bookingDetail,
      token: token,
      redirect_url: redirect_url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: error.message || 'Internal server error',
      data: null,
    });
  }
};

const getBookingByBookingCode = async (req, res) => {
  const { bookingCode } = req.query;

  if (!bookingCode) {
    return res.status(400).json({
      status: '400',
      message: 'Email query parameter is required',
      data: null,
    });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingCode },
      include: {
        flight: {
          include: {
            airport: true,
            destinationCity: true,
            originCity: true,
          },
        },
        passengers: {
          include: {
            passenger: true,
            seat: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({
        status: 404,
        message: 'Booking not found',
        data: null,
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Booking retrieved successfully',
      data: booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  }
};

const getAllBookingsByUserId = async (req, res) => {
  const { userId } = req.params;
  const userIdNumber = Number(userId);
  const { from, to, bookingCode } = req.query;

  if (from && isNaN(Date.parse(from))) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid "from" date format',
      data: null,
    });
  }

  if (to && isNaN(Date.parse(to))) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid "to" date format',
      data: null,
    });
  }

  if (from && to && new Date(from) > new Date(to)) {
    return res.status(400).json({
      status: 400,
      message: '"From" date cannot be after "to" date',
      data: null,
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userIdNumber,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
        data: null,
      });
    }

    const filters = {
      userId: userIdNumber,
    };

    if (from) {
      filters.bookingDate = {
        gte: new Date(from),
      };
    }

    if (to) {
      filters.bookingDate = {
        ...filters.bookingDate,
        lte: new Date(to),
      };
    }

    if (bookingCode) {
      filters.bookingCode = bookingCode;
    }

    const bookings = await prisma.booking.findMany({
      where: filters,
      include: {
        flight: {
          include: {
            airport: true,
            destinationCity: true,
            originCity: true,
          },
        },
        passengers: {
          include: {
            passenger: true,
            seat: true,
          },
        },
      },
    });

    if (bookings.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No bookings found for this user',
        data: null,
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Bookings retrieved successfully',
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  }
};

const handlePaymentNotification = async (req, res) => {
  try {
    const notification = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    const statusResponse = await notification.transaction.notification(req.body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    if (!orderId || !transactionStatus || !fraudStatus) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid notification data',
      });
    }

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || fraudStatus === 'settlement') {
        await prisma.booking.update({
          where: { bookingCode: orderId },
          data: { status: 'paid' },
        });
        const booking = await prisma.booking.update({
          where: {
            bookingCode: orderId,
          },
          data: { status: 'paid' },
          include: {
            passengers: {
              include: {
                seat: true,
              },
            },
          },
        });
        await Promise.all(
          booking.passengers.map((passenger) => {
            return prisma.seat.update({
              where: { id: passenger.seatId },
              data: { status: 'booked' },
            });
          })
        );
      }
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      await prisma.booking.update({
        where: { bookingCode: orderId },
        data: { status: 'cancelled' },
      });
    }

    const paymentDetail = await prisma.booking.findUnique({
      where: {
        bookingCode: orderId
      },
      select: {
        email,
      }
    });

    const sendMailNotification = await notificationService({
      email: paymentDetail.email,
      type: 'Notifikasi',
      title: 'Payment Notification',
      detail: `Payment for booking ${paymentDetail.bookingCode} has been ${transactionStatus}`,
    })

    return res.status(200).json({
      status: 200,
      message: 'OK',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: 'Error processing payment notification',
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getAllBookingsByUserId,
  handlePaymentNotification,
  getBookingByBookingCode,
};
