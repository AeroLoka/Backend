const { createBooking, getAllBookingsByUserId } = require('../controllers/transaction-controller');
const { getFlights } = require('../controllers/flightController');
const {
  getAllFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
} = require('../controllers/airfareControllers');

const { login, register } = require('../controllers/auth-controler');

const routes = require('express').Router();

routes.post('/api/booking', createBooking);
routes.get('/api/booking/:userId', getAllBookingsByUserId);
routes.get('/api/search-flights', getFlights);

routes.get('/api/flights/', getAllFlights);
routes.get('/api/flights/:id', getFlightById);
routes.post('/api/flights/', createFlight);
routes.put('/api/flights/:id', updateFlight);
routes.delete('/api/flights/:id', deleteFlight);

routes.post('/api/register', register);
routes.post('/api/login', login);

module.exports = routes;
