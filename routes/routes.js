const { createBooking, getAllBookingsByUserId } = require('../controllers/transaction-controller');
const { getFlights } = require('../controllers/flightController');
const {
  getAllFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
} = require('../controllers/airfareControllers');

const {
  login,
  register,
  resetPassword,
  sendEmailForgetPassword,
  verifyOtp,
  resendOtp,
  oauthLogin,
} = require('../controllers/auth-controler');

const routes = require('express').Router();
const passport = require('../services/passport');
const { restrict } = require('../middleware/jwt');

routes.post('/api/booking', restrict, createBooking);
routes.get('/api/booking/:userId', restrict, getAllBookingsByUserId);
routes.get('/api/search-flights', restrict, getFlights);

routes.get('/api/flights/', restrict, getAllFlights);
routes.get('/api/flights/:id', restrict, getFlightById);
routes.post('/api/flights/', restrict, createFlight);
routes.put('/api/flights/:id', restrict, updateFlight);
routes.delete('/api/flights/:id', restrict, deleteFlight);

routes.post('/api/register', register);
routes.post('/api/verify-otp', verifyOtp);
routes.post('/api/resend-otp', resendOtp);
routes.post('/api/login', login);
routes.post('/api/forget-password', sendEmailForgetPassword);
routes.post('/api/reset-password', resetPassword);

routes.get(
  '/api/google',
  passport.authenticate('google', {
    session: false,
    scope: ['email', 'profile'],
  })
);

routes.get('/google/callback', passport.authenticate('google', { session: false }), oauthLogin);

module.exports = routes;
