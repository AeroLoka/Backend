const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const flightSchema = require("../validations/flight-validations");

exports.getAllFlights = async (req, res) => {
    try {
        const flights = await prisma.flight.findMany();
        res.status(200).json({
            message: "Data retrieved successfully",
            data: flights,
        });

        if (flights.length === 0) {
            return res.status(404).json({ error: "No flights found" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getFlightById = async (req, res) => {
    try {
        const flightId = Number(req.params.id);
        if (isNaN(flightId)) {
            return res.status(400).json({ error: "Invalid flight ID" });
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
            return res.status(404).json({ error: "Flight not found" });
        }

        res.status(200).json({
            message: "Data retrieved successfully",
            data: flight,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.createFlight = async (req, res) => {
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
            message: "Resource created successfully",
            data: flight,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.updateFlight = async (req, res) => {
    const { error } = flightSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const flightId = Number(req.params.id);
        if (isNaN(flightId)) {
            return res.status(400).json({ error: "Invalid flight ID" });
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
            return res.status(404).json({ error: "Flight not found" });
        }

        res.status(200).json({
            message: "Resource updated successfully",
            data: flight,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.deleteFlight = async (req, res) => {
    try {
        const flightId = Number(req.params.id);
        if (isNaN(flightId)) {
            return res.status(400).json({ error: "Invalid flight ID" });
        }

        const flight = await prisma.flight.delete({
            where: { id: flightId },
        });

        res.status(200).json({
            message: "Resource deleted successfully",
            data: flight,
        });
    } catch (error) {
        console.error(error);
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Flight not found" });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
};
