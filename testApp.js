const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'testing') {
    dotenv.config();
}

const app = express();
const router = require('./routes/routes');

const passport = require('./services/passport');
app.use(passport.initialize());

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/', router);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message });
});

module.exports = app;