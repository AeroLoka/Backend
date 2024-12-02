const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const flightSchema = require('../validations/flight-validations');

const getAllFlights = async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;

  try {
    const flights = await prisma.flight.findMany({
      skip,
      take,
    });

    const totalFlights = await prisma.flight.count();

    if (flights.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No flights found',
        data: null,
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Data retrieved successfully',
      data: flights,
      meta: {
        total: totalFlights,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(totalFlights / take),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  }
};

const getFlightById = async (req, res) => {
  try {
    const flightId = Number(req.params.id);
    if (isNaN(flightId)) {
      return res.status(400).json({ error: 'Invalid flight ID' });
    }

    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        airlines: true,
        airport: true,
        originCity: true,
        destinationCity: true,
      },
    });

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    res.status(200).json({
      message: 'Data retrieved successfully',
      data: flight,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const createFlight = async (req, res) => {
  const { error } = flightSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const flight = await prisma.flight.create({
      data: {
        airlinesId: req.body.airlinesId,
        airportId: req.body.airportId,
        originCityId: req.body.originCityId,
        destinationCityId: req.body.destinationCityId,
        departure: new Date(req.body.departure),
        return: new Date(req.body.return),
        price: req.body.price,
        capacity: req.body.capacity,
        class: req.body.class,
        information: req.body.information,
        duration: req.body.duration,
      },
    });

    res.status(201).json({
      message: 'Resource created successfully',
      data: flight,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateFlight = async (req, res) => {
  const { error } = flightSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const flightId = Number(req.params.id);
    if (isNaN(flightId)) {
      return res.status(400).json({ error: 'Invalid flight ID' });
    }

    const flight = await prisma.flight.update({
      where: { id: flightId },
      data: {
        airlinesId: req.body.airlinesId,
        airportId: req.body.airportId,
        originCityId: req.body.originCityId,
        destinationCityId: req.body.destinationCityId,
        departure: new Date(req.body.departure),
        return: new Date(req.body.return),
        price: req.body.price,
        capacity: req.body.capacity,
        class: req.body.class,
        information: req.body.information,
        duration: req.body.duration,
      },
    });

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    res.status(200).json({
      message: 'Resource updated successfully',
      data: flight,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteFlight = async (req, res) => {
  try {
    const flightId = Number(req.params.id);
    if (isNaN(flightId)) {
      return res.status(400).json({ error: 'Invalid flight ID' });
    }

    const flight = await prisma.flight.delete({
      where: { id: flightId },
    });

    res.status(200).json({
      message: 'Resource deleted successfully',
      data: flight,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Flight not found' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { createFlight, deleteFlight, getAllFlights, getFlightById, updateFlight };
