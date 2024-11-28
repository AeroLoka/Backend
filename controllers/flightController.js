const { search, filterFlights } = require('../services/flightService');

const validCriteria = ['benua', 'kelas', 'kota', 'negara'];
const validFilters = [
  'harga-termurah',
  'harga-termahal',
  'durasi-terpendek',
  'durasi-terpanjang',
  'keberangkatan-paling-awal',
  'keberangkatan-paling-akhir',
  'kedatangan-paling-awal',
  'kedatangan-paling-akhir',
];

const getFlights = async (req, res) => {
  try {
    let flights;
    const { criteria, value, filter } = req.query;

    if (criteria && !validCriteria.includes(criteria)) {
      return res.status(400).json({ success: false, message: 'Kriteria tidak valid' });
    }

    if (filter && !validFilters.includes(filter)) {
      return res.status(400).json({ success: false, message: 'Filter tidak valid' });
    }

    if (criteria && value) {
      flights = await search(criteria, value);
    } else if (filter) {
      flights = await filterFlights(filter);
    } else {
      return res
        .status(400)
        .json({ success: false, message: 'Kriteria atau filter tidak diberikan' });
    }

    if (!flights || flights.length === 0) {
      return res.status(404).json({ success: false, message: 'Tidak ada penerbangan ditemukan' });
    }

    res.status(200).json({
      success: true,
      data: flights,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server',
    });
  }
};

module.exports = { getFlights };
