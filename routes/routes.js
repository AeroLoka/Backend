const { createBooking, getAllBookingsByUserId } = require('../controller/transaction-controller');
const routes = require('express').Router();

routes.post('/api/booking', createBooking);
routes.get('/api/booking/:userId', getAllBookingsByUserId);

module.exports = routes;
