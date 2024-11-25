const express = require('express');
const morgan = require('morgan');
const PORT = 3000;

const flightRoutes = require('./routes/flightRoutes');

const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use('/api/v1/flights', flightRoutes);

app.get('/', (req, res) => {
    res.send('Hello, AeroLoka!');
});

app.listen(PORT, () => {
    console.log(`Server berjalan di Port ${PORT}`);
});