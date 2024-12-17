const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const flightSchema = require("../validations/flightValidations");

const getAllFlights = async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;

  try {
    const flights = await prisma.flight.findMany({
      skip,
      take,
      include: {
        airlines: true,
        airport: true,
        originCity: true,
        destinationCity: true,
      },
    });

    const totalFlights = await prisma.flight.count();

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
  // Validasi request body untuk flight
  const { error } = flightSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 400,
      message: error.details[0].message,
      data: null,
    });
  }

  try {
    // 1. Validasi file upload (cek keberadaan file)
    if (!req.file || req.file.size === 0) {
      return res.status(400).json({
        status: 400,
        message: "Bad request - No file uploaded",
        data: null,
      });
    }

    // 2. Konversi file buffer ke base64
    let stringFile = req.file.buffer.toString("base64");
    const fileName = req.body.judul || req.file.originalname;

    // 3. Upload ke ImageKit
    const uploadImage = await imageKit.upload({
      fileName: fileName,
      file: stringFile,
    });

    console.log(uploadImage, "===> INI uploadImage");

    // 4. Simpan informasi image ke database Prisma
    const resultImage = await prisma.image.create({
      data: {
        judul: fileName,
        imageUrl: uploadImage.url,
        fileId: uploadImage.fileId,
        deskripsi: req.body.deskripsi || "deskripsi tempelan", // Default deskripsi jika kosong
      },
    });

    console.log(resultImage, "===> INI resultImage");

    // 5. Simpan data flight ke database Prisma
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
        imageId: resultImage.id, // Relasi ke tabel image jika ada kolom imageId
      },
    });

    // 6. Response sukses
    return res.status(201).json({
      status: 201,
      message: "Resource created successfully",
      data: {
        flight,
        image: {
          imagekitName: uploadImage.name,
          fileId: uploadImage.fileId,
          imageUrl: uploadImage.url,
        },
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
      data: flight,
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
