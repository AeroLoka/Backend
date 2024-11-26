const express = require('express');
const morgan = require('morgan');
const flightRoutes = require('./routes/flightRoutes');
const PORT = 3000;

const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use('/api', flightRoutes);

app.get('/', (req, res) => {
    res.send('Hello, AeroLoka!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di Port ${PORT}`);
});