const Joi = require('joi');

const validasiRegistrasi = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.base': 'Nama harus berupa teks.',
    'string.empty': 'Nama tidak boleh kosong.',
    'string.min': 'Nama harus memiliki minimal 3 karakter.',
    'string.max': 'Nama tidak boleh lebih dari 50 karakter.',
    'any.required': 'Nama wajib diisi.',
  }),
  email: Joi.string().email().required().messages({
    'string.base': 'Email harus berupa teks.',
    'string.email': 'Format email tidak valid.',
    'string.empty': 'Email tidak boleh kosong.',
    'any.required': 'Email wajib diisi.',
  }),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Nomor telepon harus berupa angka dengan panjang 10-15 digit.',
      'string.empty': 'Nomor telepon tidak boleh kosong.',
      'any.required': 'Nomor telepon wajib diisi.',
    }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'Kata sandi harus berupa teks.',
    'string.min': 'Kata sandi harus memiliki minimal 6 karakter.',
    'string.empty': 'Kata sandi tidak boleh kosong.',
    'any.required': 'Kata sandi wajib diisi.',
  }),
});

const validasiVerifikasiOtp = Joi.object({
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.base': 'OTP harus berupa teks.',
      'string.empty': 'OTP tidak boleh kosong.',
      'string.length': 'OTP harus terdiri dari 6 digit.',
      'string.pattern.base': 'OTP harus berupa angka.',
      'any.required': 'OTP wajib diisi.',
    }),
});

const validasiResendOtp = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': 'Email harus berupa teks.',
    'string.email': 'Format email tidak valid.',
    'string.empty': 'Email tidak boleh kosong.',
    'any.required': 'Email wajib diisi.',
  }),
});

const validasiLogin = Joi.object({
  identifier: Joi.string().required().messages({
    'string.base': 'Email harus berupa teks.',
    'string.empty': 'Email tidak boleh kosong.',
    'any.required': 'Email wajib diisi.',
  }),
  password: Joi.string().required().messages({
    'string.base': 'Kata sandi harus berupa teks.',
    'string.empty': 'Kata sandi tidak boleh kosong.',
    'any.required': 'Kata sandi wajib diisi.',
  }),
});

const validasiLupaPassword = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': 'Email harus berupa teks.',
    'string.email': 'Format email tidak valid.',
    'string.empty': 'Email tidak boleh kosong.',
    'any.required': 'Email wajib diisi.',
  }),
});

const validasiResetPassword = Joi.object({
  password: Joi.string().min(6).required().messages({
    'string.base': 'Kata sandi harus berupa teks.',
    'string.min': 'Kata sandi harus memiliki minimal 6 karakter.',
    'string.empty': 'Kata sandi tidak boleh kosong.',
    'any.required': 'Kata sandi wajib diisi.',
  }),
  confirm_password: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Konfirmasi kata sandi harus sama dengan kata sandi.',
    'string.empty': 'Konfirmasi kata sandi tidak boleh kosong.',
    'any.required': 'Konfirmasi kata sandi wajib diisi.',
  }),
});

module.exports = {
  validasiRegistrasi,
  validasiVerifikasiOtp,
  validasiResendOtp,
  validasiLogin,
  validasiLupaPassword,
  validasiResetPassword,
};
