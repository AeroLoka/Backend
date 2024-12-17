const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllSeatByFlightId = async (req, res) => {
  const { flightId } = req.params;
  const parsedFlightId = parseInt(flightId);
  const seat = await prisma.seat.findMany({
    where: { flightId: parsedFlightId },
    include: {
      BookingPassenger: true,
      flight: true,
    },
  });

  if (!seat) {
    return res.status(404).json({
      status: 404,
      message: 'seat not found',
      data: null,
    });
  }

  return res.status(200).json({
    status: 200,
    message: 'seat retrieved successfully',
    data: seat,
  });
};

module.exports = { getAllSeatByFlightId };
