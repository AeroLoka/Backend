const { searchFlight, filterFlights } = require('../services/flightService');

const getFlights = async (req, res) => {
  try {
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
    } = req.query;

    if (req.query.sortBy) {
      const flights = await filterFlights(req.query.sortBy);

      if (!flights || flights.length === 0) {
        return res.status(404).json({
          status: 404,
          success: false,
          message: 'Penerbangan tidak ditemukan berdasarkan filter',
        });
      }

      return res.status(200).json({
        success: true,
        data: flights,
      });
    }

    if (!from) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'Kota asal tidak boleh kosong',
      });
    }

    if (!to) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'kota tujuan tidak boleh kosong',
      });
    }

    if (!departureDateStart || isNaN(Date.parse(departureDateStart))) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'Tanggal keberangkatan tidak valid atau kosong',
      });
    }

    if (!returnDateStart || isNaN(Date.parse(returnDateStart))) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'Tanggal kedatangan tidak valid atau kosong',
      });
    }

    const totalPassengers =
      parseInt(adultPassengers || 0) +
      parseInt(childPassengers || 0) +
      parseInt(infantPassengers || 0);

    if (totalPassengers <= 0) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'At least one passenger (Adult, Child, Infant) is required',
      });
    }

    if (!seatClass) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'Tipe kelas penerbangan tidak boleh kosong',
      });
    }

    const flights = await searchFlight(
      {
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
      },
      true
    );

    if (!flights || flights.length === 0) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: 'Maaf, Penerbangan tidak ditemukan.',
      });
    }

    res.status(200).json({
      success: true,
      data: flights,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      success: false,
      message: error.message || 'Terjadi kesalahan pada server',
    });
  }
};

module.exports = { getFlights };
