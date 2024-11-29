const express = require('express');
const morgan = require('morgan');
const PORT = 3000;

const app = express();
const router = require('./routes/routes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', router);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di Port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
