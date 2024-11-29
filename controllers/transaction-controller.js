const { PrismaClient } = require('@prisma/client');
const { bookingSchema } = require('../validations/transaction-validation');
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
        message: 'User not found',
        data: null,
      });
    }

    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
    });
    if (!flight) {
      return res.status(404).json({
        status: 404,
        message: 'Flight not found',
        data: null,
      });
    }

    const seatPromises = seats.map(async (seatNumber) => {
      const seat = await prisma.seat.findFirst({
        where: {
          flightId,
          seatNumber,
          status: 'available',
        },
      });

      if (!seat) {
        await prisma.seat.create({
          data: {
            flightId,
            seatNumber,
            status: 'available',
          },
        });
      }
    });

    await Promise.all(seatPromises);

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        flightId,
        totalPrice,
        bookingDate: new Date(),
        totalPassenger: passengers.length,
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

    const bookingPassengerPromises = createdPassengers.map(async (createdPassenger, index) =>
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
      data: { status: 'booked' },
    });

    res.status(201).json({
      status: 201,
      message: 'Booking created successfully',
      data: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        bookingId: booking.id,
        totalPrice,
        bookingDate: new Date(),
        totalPassenger: passengers.length,
        seats,
        passengers: createdPassengers,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: error.message,
      data: null,
    });
  }
};

const getAllBookingsByUserId = async (req, res) => {
  const { userId } = req.params;
  const userIdNumber = Number(userId);

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

    const bookings = await prisma.booking.findMany({
      where: {
        userId: userIdNumber,
      },
      include: {
        flight: true,
        passengers: true,
      },
    });

    if (bookings.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No bookings found for this user',
        data: null,
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Bookings retrieved successfully',
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: error.message,
      data: null,
    });
  }
};

module.exports = { createBooking, getAllBookingsByUserId };
