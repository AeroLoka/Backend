const { PrismaClient } = require("@prisma/client");
const { bookingSchema } = require("../validations/transaction-validation");
const { generateUniqueBookingCode } = require("../utils/generateRandomCode");
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
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }

    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
    });
    if (!flight) {
      return res.status(404).json({
        status: 404,
        message: "Flight not found",
        data: null,
      });
    }

    const seatPromises = seats.map(async (seatNumber) => {
      const seat = await prisma.seat.findFirst({
        where: {
          flightId,
          seatNumber,
          status: "available",
        },
      });

      if (!seat) {
        await prisma.seat.create({
          data: {
            flightId,
            seatNumber,
            status: "available",
          },
        });
      }
    });

    await Promise.all(seatPromises);

    const bookingCode = await generateUniqueBookingCode(prisma);

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        flightId,
        totalPrice,
        bookingDate: new Date(),
        totalPassenger: passengers.length,
        status: "unpaid",
        bookingCode: bookingCode,
      },
    });

    const passengerPromises = passengers.map((passenger) =>
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
    );

    const createdPassengers = await Promise.all(passengerPromises);

    const bookingPassengerPromises = createdPassengers.map(
      async (createdPassenger, index) =>
        prisma.bookingPassenger.create({
          data: {
            bookingId: booking.id,
            passengerId: createdPassenger.id,
            seatId: await prisma.seat
              .findFirst({
                where: {
                  flightId,
                  seatNumber: seats[index],
                },
              })
              .then((seat) => seat.id),
          },
        })
    );

    await Promise.all(bookingPassengerPromises);

    await prisma.seat.updateMany({
      where: {
        flightId,
        seatNumber: { in: seats },
      },
      data: { status: "booked" },
    });

    // Integrasi pembayaran menggunakan Midtrans
    const midtransClient = require("midtrans-client");
    require("dotenv").config();

    const snap = new midtransClient.Snap({
      isProduction: false, // Ganti ke `true` untuk produksi
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: bookingCode, // Gunakan kode pemesanan sebagai order_id
        gross_amount: totalPrice, // Total harga
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
    };

    try {
      const token = await snap.createTransaction(parameter);

      // Ambil hanya token ID dari response Midtrans
      const { token: transactionToken } = token;

      res.status(201).json({
        status: 201,
        message: "Booking created successfully",
        isSucces: true,
        // hanya mengirim token ID
        data: {
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          bookingId: booking.id,
          totalPrice,
          bookingStatus: booking.status,
          bookingCode,
          bookingDate: new Date(),
          totalPassenger: passengers.length,
          seats,
          passengers: createdPassengers,
        },
        token: transactionToken,
      });
    } catch (paymentError) {
      console.error(paymentError);
      res.status(500).json({
        status: 500,
        message: "Booking created but failed to generate payment URL",
        data: {
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          bookingId: booking.id,
          totalPrice,
          bookingStatus: booking.status,
          bookingCode,
          bookingDate: new Date(),
          totalPassenger: passengers.length,
          seats,
          passengers: createdPassengers,
        },
        paymentError: paymentError.message,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: error.message,
      data: null,
    });
  }
};

module.exports = createBooking;

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
        message: "User not found",
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
      },
    });

    if (bookings.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No bookings found for this user",
        data: null,
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      data: null,
    });
  }
};

module.exports = { createBooking, getAllBookingsByUserId };
