const Joi = require('joi');

const flightSchema = Joi.object({
  airlinesId: Joi.number().required().messages({
    'number.base': 'Airlines ID harus berupa angka',
    'any.required': 'Airlines ID wajib diisi',
  }),
  airportId: Joi.number().required().messages({
    'number.base': 'Airport ID harus berupa angka',
    'any.required': 'Airport ID wajib diisi',
  }),
  originCityId: Joi.number().required().messages({
    'number.base': 'Origin City ID harus berupa angka',
    'any.required': 'Origin City ID wajib diisi',
  }),
  destinationCityId: Joi.number().required().messages({
    'number.base': 'Destination City ID harus berupa angka',
    'any.required': 'Destination City ID wajib diisi',
  }),
  departure: Joi.date().required().messages({
    'date.base': 'Departure harus berupa tanggal yang valid',
    'any.required': 'Departure wajib diisi',
  }),
  return: Joi.date().required().messages({
    'date.base': 'Return harus berupa tanggal yang valid',
    'any.required': 'Return wajib diisi',
  }),
  price: Joi.number().required().messages({
    'number.base': 'Price harus berupa angka',
    'any.required': 'Price wajib diisi',
  }),
  capacity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Capacity harus berupa angka',
    'number.integer': 'Capacity harus berupa bilangan bulat',
    'number.min': 'Capacity harus minimal 1',
    'any.required': 'Capacity wajib diisi',
  }),
  class: Joi.string().valid('economy', 'business', 'first').required().messages({
    'string.base': 'Class harus berupa string',
    'any.only': 'Class harus salah satu dari: economy, business, first',
    'any.required': 'Class wajib diisi',
  }),
  information: Joi.string().allow('').optional().messages({
    'string.base': 'Information harus berupa string',
  }),
  duration: Joi.number().integer().min(1).required().messages({
    'number.base': 'Duration harus berupa angka',
    'number.integer': 'Duration harus berupa bilangan bulat',
    'number.min': 'Duration harus minimal 1',
    'any.required': 'Duration wajib diisi',
  }),
});

module.exports = flightSchema;