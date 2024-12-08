const routes = require('express').Router();
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
const passport = require('../services/passport');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

routes.get('/api/users', getAllUsers);
routes.get('/api/users/:id', getUserById);
routes.post('/api/users/', createUser);
routes.put('/api/users/:id', updateUser);
routes.delete('/api/users/:id', deleteUser);

routes.post('/api/booking', createBooking);
routes.get('/api/booking/:userId', getAllBookingsByUserId);

routes.get('/api/search-flights', getFlights);
routes.get('/api/flights/', getAllFlights);
routes.get('/api/flights/:id', getFlightById);
routes.post('/api/flights/', createFlight);
routes.put('/api/flights/:id', updateFlight);
routes.delete('/api/flights/:id', deleteFlight);

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
