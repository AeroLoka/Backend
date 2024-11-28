const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createBooking = async (req, res) => {
  const { email, flightId, totalPrice, passengers, seats } = req.body;

  try {
    // Step 1: Check if the user exists
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

    // Step 2: Check if the flight exists
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

    // Step 3: Verify and create seats for each requested seat
    const seatPromises = seats.map(async (seatNumber) => {
      // Step 3a: Check if the seat already exists and if it's available
      const seat = await prisma.seat.findFirst({
        where: {
          flightId,
          seatNumber,
          status: 'available',
        },
      });

      if (!seat) {
        // Step 3b: Create the seat if it doesn't exist or is not available
        await prisma.seat.create({
          data: {
            flightId,
            seatNumber,
            status: 'available', // Initially set as available
          },
        });
      }
    });

    // Wait for all seats to be checked/created
    await Promise.all(seatPromises);

    // Step 4: Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        flightId,
        totalPrice,
        bookingDate: new Date(),
        totalPassenger: passengers.length,
      },
    });

    // Step 5: Add passengers
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

    // Step 6: Link passengers and seats to booking in BookingPassenger
    const bookingPassengerPromises = createdPassengers.map(async (createdPassenger, index) =>
      prisma.bookingPassenger.create({
        data: {
          bookingId: booking.id,
          passengerId: createdPassenger.id,
          seatId: await prisma.seat
            .findFirst({
              where: {
                flightId,
                seatNumber: seats[index], // Matching seat number with the created seat
              },
            })
            .then((seat) => seat.id), // Retrieve the seat ID after creation
        },
      })
    );

    await Promise.all(bookingPassengerPromises);

    // Step 7: Update seat status to 'booked'
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
        email: user.phoneNumber,
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
    // Step 1: Check if the user exists
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

    // Step 2: Fetch all bookings by the user
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
