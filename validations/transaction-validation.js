const Joi = require('joi');

const bookingSchema = Joi.object({
  email: Joi.string().email().required(),
  flightId: Joi.number().integer().required(),
  totalPrice: Joi.number().positive().required(),
  passengers: Joi.array()
    .items(
      Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        birthDate: Joi.date().iso().required(),
        nationality: Joi.string().required(),
        passportNumber: Joi.string().required(),
        passportExpiry: Joi.date().iso().required(),
      })
    )
    .min(1)
    .required(),
  seats: Joi.array().items(Joi.string().required()).min(1).required(),
});

module.exports = { bookingSchema };
