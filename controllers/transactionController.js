const { PrismaClient } = require('@prisma/client');
const { bookingSchema } = require('../validations/transactionValidation');
const { generateUniqueBookingCode } = require('../utils/generateRandomCode');
const { createPayment } = require('../services/payment');
const prisma = new PrismaClient();

const createBooking = async (req, res) => {
  const { email, flightId, totalPrice, passengers, seats } = req.body;
  const { error } = bookingSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 400,
      message: error.details[0].message,
      data: null,
    });
  }

  try {
    const result = await prisma.$transaction(async (prisma) => {
      let currentSeats = await prisma.seat.findMany({
        where: {
          flightId,
          seatNumber: { in: seats },
        },
      });

      const existingSeatNumbers = currentSeats.map((seat) => seat.seatNumber);
      const missingSeats = seats.filter((seatNum) => !existingSeatNumbers.includes(seatNum));

      if (missingSeats.length > 0) {
        await Promise.all(
          missingSeats.map((seatNumber) =>
            prisma.seat.create({
              data: {
                flightId,
                seatNumber,
                status: 'available',
                version: 1,
              },
            })
          )
        );

        currentSeats = await prisma.seat.findMany({
          where: {
            flightId,
            seatNumber: { in: seats },
          },
        });
      }

      const bookedSeats = currentSeats.filter((seat) => seat.status === 'booked');
      if (bookedSeats.length > 0) {
        return {
          status: 400,
          error: `Seats ${bookedSeats.map((s) => s.seatNumber).join(', ')} are already booked`,
        };
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return { status: 404, error: 'User not found' };
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
              lastName: passenger.lastName,
              birthDate: new Date(passenger.birthDate),
              nationality: passenger.nationality,
              passportNumber: passenger.passportNumber,
              passportExpiry: new Date(passenger.passportExpiry),
            },
          })
        )
      );

      const updatedSeatsAndBookings = await Promise.all(
        currentSeats.map(async (seat, index) => {
          try {
            const updatedSeat = await prisma.seat.update({
              where: {
                id: seat.id,
                version: seat.version,
                status: 'available',
              },
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

      return {
        booking,
        user,
        passengers: createdPassengers,
        seats: updatedSeatsAndBookings,
      };
    });

    if (result.error) {
      return res.status(result.status).json({
        status: result.status,
        message: result.error,
        data: null,
      });
    }

    const { token, redirect_url } = await createPayment(result);

    return res.status(201).json({
      status: 201,
      message: 'Booking created successfully',
      data: {
        name: result.user.name,
        email: result.user.email,
        phoneNumber: result.user.phoneNumber,
        bookingId: result.booking.id,
        totalPrice,
        bookingStatus: result.booking.status,
        bookingCode: result.booking.bookingCode,
        bookingDate: result.booking.bookingDate,
        totalPassenger: passengers.length,
        seats: result.seats.map((s) => s.seatNumber),
        passengers: result.passengers,
      },
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
        flight: true,
        passengers: true,
        user: true,
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

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        await prisma.booking.update({
          where: { bookingCode: orderId },
          data: { status: 'paid' },
        });
      }
    } else if (transactionStatus === 'settlement') {
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
              seat,
            },
          },
        },
      });
      await Promise.all(
        booking.passengers.map((passenger) => {
          prisma.seat.update({
            where: { id: passenger.seatId },
            data: { status: 'booked' },
          });
        })
      );
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

    return res.status(200).json({ status: 200, message: 'OK' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: 'Error processing payment notification',
      error: error.message,
    });
  }
};

module.exports = { createBooking, getAllBookingsByUserId, handlePaymentNotification };
