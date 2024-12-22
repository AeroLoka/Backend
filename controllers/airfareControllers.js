const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const imageKit = require("../middleware/imageKit");
const flightSchema = require("../validations/flightValidations");

const getAllFlights = async (req, res) => {
  const { limit = 10, page = 1, continent } = req.query;
  const take = Number.isInteger(parseInt(limit)) ? parseInt(limit) : 10;
  const skip = Number.isInteger(parseInt(page))
    ? (parseInt(page) - 1) * take
    : 0;

  try {
    let whereCondition = {};

    if (continent && continent !== "semua") {
      whereCondition = {
        airport: {
          continent: {
            equals: continent.toLowerCase(),
            mode: "insensitive",
          },
        },
      };
    }

    const flights = await prisma.flight.findMany({
      skip,
      take,
      where: whereCondition,
      include: {
        airlines: true,
        airport: true,
        originCity: true,
        destinationCity: true,
      },
    });

    const totalFlights = await prisma.flight.count({
      where: whereCondition,
    });

    if (flights.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No flights found",
        data: null,
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Data retrieved successfully",
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
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const getFlightById = async (req, res) => {
  try {
    const flightId = Number(req.params.id);
    if (isNaN(flightId)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid flight ID",
        data: null,
      });
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
      return res.status(404).json({
        status: 404,
        message: "Flight not found",
        data: null,
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Data retrieved successfully",
      data: flight,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const createFlight = async (req, res) => {
  try {
    if (!req.file || req.file.size === 0) {
      return res.status(400).json({
        status: 400,
        message: "Bad request - No file uploaded",
        data: null,
      });
    }
    let stringFile = req.file.buffer.toString("base64");
    const fileName = req.body.judul || req.file.originalname;
    const uploadImage = await imageKit.upload({
      fileName: fileName,
      file: stringFile,
    });
    const data4 = {
      judul: fileName,
      imageUrl: uploadImage.url,
      fileId: uploadImage.fileId,
      deskripsi: req.body.deskripsi || "deskripsi tempelan",
    };
    const data3 = {
      airlinesId: +req.body.airlinesId,
      airportId: +req.body.airportId,
      originCityId: +req.body.originCityId,
      destinationCityId: +req.body.destinationCityId,
      departure: new Date(req.body.departure),
      return: new Date(req.body.return),
      price: +req.body.price,
      capacity: +req.body.capacity,
      class: req.body.class,
      information: req.body.information,
      duration: +req.body.duration,
      imageUrl: uploadImage.url,
    };
    const pesawat = await prisma.flight.create({
      data: data3,
    });
    return res.status(201).json({
      status: 201,
      message: "Resource created successfully",
      data: {
        data3,
      },
    });
  } catch (error) {
    console.error(error, "===> INI ERROR createFlight");

    return res.status(500).json({
      status: 500,
      message:
        "Internal Server Error - gagal membuat data flight atau upload image",
      error: error.message,
    });
  }
};

const updateFlight = async (req, res) => {
  const { error } = flightSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 400,
      message: error.details[0].message,
      data: null,
    });
  }

  try {
    const flightId = Number(req.params.id);
    if (isNaN(flightId)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid flight ID",
        data: null,
      });
    }
    let stringFile = req.file.buffer.toString("base64");
    // console.log(stringFile, "ini string file");
    const fileName = req.body.judul || req.file.originalname;
    const uploadImage = await imageKit.upload({
      fileName: fileName,
      file: stringFile,
    });
    const data4 = {
      judul: fileName,
      imageUrl: uploadImage.url,
      fileId: uploadImage.fileId,
      deskripsi: req.body.deskripsi || "deskripsi ",
    };
    const flight = await prisma.flight.update({
      where: { id: flightId },
      data: {
        airlinesId: +req.body.airlinesId,
        airportId: +req.body.airportId,
        originCityId: +req.body.originCityId,
        destinationCityId: +req.body.destinationCityId,
        departure: new Date(req.body.departure),
        return: new Date(req.body.return),
        price: +req.body.price,
        capacity: +req.body.capacity,
        class: req.body.class,
        information: req.body.information,
        duration: +req.body.duration,
        imageUrl: uploadImage.url,
      },
    });

    if (!flight) {
      return res.status(404).json({
        status: 404,
        message: "Flight not found",
        data: null,
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Resource updated successfully",
      data: flight,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const deleteFlight = async (req, res) => {
  try {
    const flightId = Number(req.params.id);
    if (isNaN(flightId)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid flight ID",
        data: null,
      });
    }

    const flight = await prisma.flight.delete({
      where: { id: flightId },
    });

    return res.status(200).json({
      status: 200,
      message: "Resource deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({
        status: 404,
        message: "Flight not found",
        data: null,
      });
    }
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      data: null,
    });
  }
};

module.exports = {
  createFlight,
  deleteFlight,
  getAllFlights,
  getFlightById,
  updateFlight,
};
