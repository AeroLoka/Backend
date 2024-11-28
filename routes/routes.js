const { createBooking } = require('../controller/transaction-controller');
const { getFlights } = require('../controllers/flightController');
const routes = require('express').Router();

routes.post('/api/booking', createBooking);
routes.get('/api/search-flights', getFlights);


module.exports = routes;
