const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const searchFlight = async (params, includePassengers = true) => {
  const {
    from,
    to,
    departureDateStart,
    departureDateEnd,
    returnDateStart,
    returnDateEnd,
    adultPassengers,
    childPassengers,
    infantPassengers,
    seatClass,
  } = params;

  const totalPassengers =
    parseInt(adultPassengers || 0) +
    parseInt(childPassengers || 0) +
    parseInt(infantPassengers || 0);

  if (totalPassengers <= 0) {
    throw new Error('Total harus lebih dari nol!');
  }

  const where = {};

  if (from) {
    where.originCity = { fullname: from };
  }

  if (to) {
    where.destinationCity = { fullname: to };
  }

  if (departureDateStart) {
    const depStart = new Date(departureDateStart);
    if (isNaN(depStart)) {
      throw new Error('Tanggal keberangkatan tidak valid.');
    }
    where.departure = { gte: depStart };
  }

  if (departureDateEnd) {
    const depEnd = new Date(departureDateEnd);
    if (isNaN(depEnd)) {
      throw new Error('Tanggal keberangkatan tidak valid.');
    }
    where.departure = { lte: depEnd };
  }

  if (returnDateStart) {
    const returnStart = new Date(returnDateStart);
    if (isNaN(returnStart)) {
      throw new Error('Tanggal kedatangan tidak valid.');
    }
    where.return = { gte: returnStart };
  }

  if (returnDateEnd) {
    const returnEnd = new Date(returnDateEnd);
    if (isNaN(returnEnd)) {
      throw new Error('Tanggal kedatangan tidak valid.');
    }
    where.return = { lte: returnEnd };
  }

  if (seatClass) {
    where.class = seatClass;
  }

  try {
    const flights = await prisma.flight.findMany({
      where,
      include: {
        originCity: true,
        destinationCity: true,
        airlines: true,
        airport: true,
        bookings: includePassengers,
      },
    });

    const filteredFlights = flights.filter((flight) => {
      const availableSeats = flight.capacity - flight.bookings.length;
      return availableSeats >= totalPassengers;
    });

    return filteredFlights;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const filterFlights = async (filter) => {
  const sortBy = {
    'harga-termurah': { price: 'asc' },
    'harga-termahal': { price: 'desc' },
    'durasi-terpendek': { duration: 'asc' },
    'durasi-terpanjang': { duration: 'desc' },
    'keberangkatan-paling-awal': { departure: 'asc' },
    'keberangkatan-paling-akhir': { departure: 'desc' },
    'kedatangan-paling-awal': { return: 'asc' },
    'kedatangan-paling-akhir': { return: 'desc' },
  };

  if (sortBy[filter]) {
    return prisma.flight.findMany({
      orderBy: sortBy[filter],
      include: {
        originCity: true,
        destinationCity: true,
        airlines: true,
        airport: true,
      },
    });
  }

  return [];
};

module.exports = {
  searchFlight,
  filterFlights,
};
