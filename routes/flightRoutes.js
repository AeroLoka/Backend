const routes = require('express').Router();
const flightController = require('../controllers/flightControllers');

routes.get('/flightroutes', (req, res) => {
    res.send('AeroLoka! Flight Routes');
})

routes.get('/api/flights/', flightController.getAllFlights);
routes.get('/api/flights/:id', flightController.getFlightById);
routes.post('/api/flights/', flightController.createFlight);
routes.put('/api/flights/:id', flightController.updateFlight);
routes.delete('/api/flights/:id', flightController.deleteFlight);


module.exports = routes;