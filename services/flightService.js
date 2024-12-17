const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const searchFlight = async (params, includePassengers = true) => {
    const {
        kotaAsal,
        kotaTujuan,
        tanggalKeberangkatan,
        tanggalKedatangan,
        penumpangDewasa,
        penumpangAnak,
        penumpangBayi,
        tipeKelas,
    } = params;

    const totalPenumpang = parseInt(penumpangDewasa || 0) + parseInt(penumpangAnak || 0) + parseInt(penumpangBayi || 0);

    const where = {};

    if (kotaAsal) {
        where.originCity = { fullname: kotaAsal };
    }

    if (kotaTujuan) {
        where.destinationCity = { fullname: kotaTujuan };
    }

    if (tanggalKeberangkatan) {
        where.departure = { gte: new Date(tanggalKeberangkatan) };
    }

    if (tanggalKedatangan) {
        where.return = { gte: new Date(tanggalKedatangan) };
    }

    if (tipeKelas) {
        where.class = tipeKelas;
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

        if (includePassengers) {
            const validFlights = flights.filter(flight => {
                const validBooking = flight.bookings.some(booking => booking.totalPassenger === totalPenumpang);
                return validBooking;
            });

            return validFlights;
        }

        return flights;
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