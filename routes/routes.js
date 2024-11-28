const { createBooking } = require('../controllers/transaction-controller');
const { getFlights } = require('../controllers/flightController');
const routes = require('express').Router();
const airfareController = require('../controllers/airfareControllers');

routes.post('/api/booking', createBooking);
routes.get('/api/search-flights', getFlights);

routes.get('/api/flights/', airfareController.getAllFlights);
routes.get('/api/flights/:id', airfareController.getFlightById);
routes.post('/api/flights/', airfareController.createFlight);
routes.put('/api/flights/:id', airfareController.updateFlight);
routes.delete('/api/flights/:id', airfareController.deleteFlight);

module.exports = routes;
