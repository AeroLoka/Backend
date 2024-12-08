const jwt = require('jsonwebtoken');

const restrict = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized. Please login or register.',
      data: null,
      redirectTo:'/api/login',
    });
  }
  const token = authorization.split(' ')[1];
  console.log('Verifying token:', token);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized. Invalid token, please login again.',
        data: null,
        redirectTo:'/api/login',
      });
    }
    req.user = decoded;
    next();
  });
};

module.exports = { restrict };
