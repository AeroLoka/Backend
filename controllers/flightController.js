const { searchFlight, filterFlights } = require('../services/flightService');

const getFlights = async (req, res) => {
  try {
    const {
      kotaAsal,
      kotaTujuan,
      tanggalKeberangkatan,
      tanggalKedatangan,
      penumpangDewasa,
      penumpangAnak,
      penumpangBayi,
      tipeKelas,
      sortBy,
    } = req.query;

    if (sortBy) {
      const flights = await filterFlights(sortBy);

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

    if (!kotaAsal) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'Kota asal tidak boleh kosong',
      });
    }
    if (!kotaTujuan) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'kota tujuan tidak boleh kosong',
      });
    }
    if (!tanggalKeberangkatan) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'tanggal keberangkatan tidak boleh kosong',
      });
    }
    if (!tanggalKedatangan) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'Tanggal Kedatangan tidak boleh kosong',
      });
    }

    if (!penumpangDewasa && !penumpangAnak && !penumpangBayi) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'Minimal salah satu penumpang (Dewasa, Anak, Bayi) harus diisi',
      });
    }

    if (!tipeKelas){
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'Tipe kelas penerbangan tidak boleh kosong',
      });
    }

    const flights = await searchFlight(
      {
        kotaAsal,
        kotaTujuan,
        tanggalKeberangkatan,
        tanggalKedatangan,
        penumpangDewasa,
        penumpangAnak,
        penumpangBayi,
        tipeKelas,
      },
      true
    );

    if (!flights || flights.length === 0) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: 'Maaf, Pencarian anda tidak ditemukan',
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