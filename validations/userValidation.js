const Joi = require('joi');

const validasiUpdateUser = Joi.object({
  name: Joi.string().min(3).max(50).optional().messages({
    'string.base': 'Nama harus berupa teks.',
    'string.empty': 'Nama tidak boleh kosong.',
    'string.min': 'Nama harus memiliki minimal 3 karakter.',
    'string.max': 'Nama tidak boleh lebih dari 50 karakter.',
  }),
  email: Joi.string().email().optional().messages({
    'string.base': 'Email harus berupa teks.',
    'string.email': 'Format email tidak valid.',
    'string.empty': 'Email tidak boleh kosong.',
  }),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Nomor telepon harus berupa angka dengan panjang 10-15 digit.',
      'string.empty': 'Nomor telepon tidak boleh kosong.',
    }),
  password: Joi.string().min(6).optional().messages({
    'string.base': 'Kata sandi harus berupa teks.',
    'string.min': 'Kata sandi harus memiliki minimal 6 karakter.',
    'string.empty': 'Kata sandi tidak boleh kosong.',
  }),
});

module.exports = { validasiUpdateUser };
