const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// INI SEARCHING
const search = async (criteria, value) => {
  if (criteria === 'benua') {
    return prisma.airports.findMany({
      where: { continent: value },
      distinct: ['continent'],
    });
  } else if (criteria === 'kelas') {
    return prisma.flight.findMany({
      where: { class: value },
      distinct: ['class'],
    });
  } else if (criteria === 'kota') {
    return prisma.city.findMany({
      where: { fullname: value },
      distinct: ['fullname'],
    });
  } else if (criteria === 'negara') {
    return prisma.airports.findMany({
      where: { city: { fullname: value } },
      distinct: ['city'],
    });
  } else {
    return [];
  }
};

// INI FILTERING
const filterFlights = async (filter) => {
  const filters = {
    'harga-termurah': { price: 'asc' },
    'harga-termahal': { price: 'desc' },
    'durasi-terpendek': { duration: 'asc' },
    'durasi-terpanjang': { duration: 'desc' },
    'keberangkatan-paling-awal': { departure: 'asc' },
    'keberangkatan-paling-akhir': { departure: 'desc' },
    'kedatangan-paling-awal': { return: 'asc' },
    'kedatangan-paling-akhir': { return: 'desc' },
  };

  if (filters[filter]) {
    return prisma.flight.findMany({
      orderBy: filters[filter],
    });
  }

  return [];
};

module.exports = {
  search,
  filterFlights,
};
