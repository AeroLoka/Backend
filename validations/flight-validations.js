const Joi = require('joi');

const flightSchema = Joi.object({
  airlinesId: Joi.number().required(),
  airportId: Joi.number().required(),
  originCityId: Joi.number().required(),
  destinationCityId: Joi.number().required(),
  departure: Joi.date().required(),
  return: Joi.date().required(),
  price: Joi.number().required(),
  capacity: Joi.number().integer().min(1).required(),
  class: Joi.string().valid('economy', 'business', 'first').required(),
  information: Joi.string().allow('').optional(),
  duration: Joi.number().integer().min(1).required(),
});

module.exports = flightSchema;
