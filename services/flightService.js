const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// INI SEARCHING
const searchFlight = async (criteria, value) => {
    if (criteria === 'benua') {
        return prisma.flight.findMany({
            where: {
                airport: {
                    continent: value
                }
            },
            distinct: ['class'],
            include: {
                originCity: true,
                destinationCity: true,
                airlines: true,
                airport: true,
            }
        });
    } else if (criteria === 'kelas') {
        return prisma.flight.findMany({
            where: { class: value },
            distinct: ['class'],
            include: {
                originCity: true,
                destinationCity: true,
                airlines: true,
                airport: true,
            }
        });
    } else if (criteria === 'kota') {
        return prisma.flight.findMany({
            where: {
                OR: [
                    { originCity: { fullname: value } },
                    { destinationCity: { fullname: value } }
                ]
            },
            distinct: ['originCityId', 'destinationCityId'],
            include: {
                originCity: true,
                destinationCity: true,
                airlines: true,
                airport: true,
            }
        });
    } else if (criteria === 'negara') {
        return prisma.flight.findMany({
            where: {
                airport: {
                    city: { fullname: value }
                }
            },
            distinct: ['class'],
            include: {
                originCity: true,
                destinationCity: true,
                airlines: true,
                airport: true,
            }
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
    searchFlight,
    filterFlights,
};