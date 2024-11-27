const { createBooking } = require('../controller/transaction-controller');
const routes = require('express').Router();

routes.post('/api/booking', createBooking);

module.exports = routes;
