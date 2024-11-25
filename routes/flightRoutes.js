const routes = require('express').Router();
const flightController = require('../controllers/flightControllers');

routes.get('/flightroutes', (req, res) => {
    res.send('AeroLoka! Flight Routes');
})

routes.get('/', flightController.getAllFlights);
routes.get('/:id', flightController.getFlightById);
routes.post('/', flightController.createFlight);
routes.put('/:id', flightController.updateFlight);
routes.delete('/:id', flightController.deleteFlight);


module.exports = routes;