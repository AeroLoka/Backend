const express = require('express');
const morgan = require('morgan');
const PORT = 3000;

const app = express();
const router = require('./routes/routes');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', router);



app.listen(PORT, () => {
    console.log(`Server berjalan di Port ${PORT}`);
});