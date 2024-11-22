const express = require('express');
const morgan = require('morgan');
const PORT = 3000;

const app = express();

app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Hello, AeroLoka!');
});

app.listen(PORT, () => {
    console.log(`Server berjalan di Port ${PORT}`);
});