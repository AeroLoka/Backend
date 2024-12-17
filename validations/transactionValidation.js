const Joi = require('joi');

const bookingSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email tidak boleh kosong',
    'string.email': 'Format email tidak valid',
    'any.required': 'Email diperlukan',
  }),
  flightId: Joi.number().integer().positive().required().messages({
    'number.base': 'Flight ID harus berupa angka',
    'number.integer': 'Flight ID harus berupa bilangan bulat',
    'number.positive': 'Flight ID harus bernilai positif',
    'any.required': 'Flight ID diperlukan',
  }),
  totalPrice: Joi.number().positive().required().messages({
    'number.base': 'Total harga harus berupa angka',
    'number.positive': 'Total harga harus bernilai positif',
    'any.required': 'Total harga diperlukan',
  }),
  passengers: Joi.array()
    .items(
      Joi.object({
        firstName: Joi.string().required().messages({
          'string.empty': 'Nama depan tidak boleh kosong',
          'any.required': 'Nama depan diperlukan',
        }),
        lastName: Joi.string().allow('').optional(),
        birthDate: Joi.date().required().messages({
          'date.base': 'Tanggal lahir harus berupa tanggal yang valid',
          'any.required': 'Tanggal lahir diperlukan',
        }),
        nationality: Joi.string().allow('').required().messages({
          'string.empty': 'Kewarganegaraan tidak boleh kosong',
          'any.required': 'Kewarganegaraan diperlukan',
        }),
        passportNumber: Joi.string().allow('').optional(),
        passportExpiry: Joi.date().greater('now').optional().messages({
          'date.base': 'Tanggal kedaluwarsa paspor harus berupa tanggal yang valid',
          'date.greater': 'Tanggal kedaluwarsa paspor harus lebih besar dari tanggal saat ini',
        }),
        ktpNumber: Joi.string().allow('').optional(),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'Penumpang harus berupa array',
      'array.min': 'Minimal harus ada 1 penumpang',
      'any.required': 'Penumpang diperlukan',
    }),
  seats: Joi.array()
    .items(
      Joi.string()
        .regex(/^[A-Za-z0-9]+$/)
        .required()
        .messages({
          'string.pattern.base': 'Nomor kursi hanya boleh berisi huruf dan angka',
          'string.empty': 'Nomor kursi tidak boleh kosong',
          'any.required': 'Nomor kursi diperlukan',
        })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'Kursi harus berupa array',
      'array.min': 'Minimal harus ada 1 kursi',
      'any.required': 'Kursi diperlukan',
    }),
});

module.exports = { bookingSchema };
