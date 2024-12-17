const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const admin = async (req, res, next) => {
  const { user } = req;
  if (!user) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized. Please login.',
      data: null,
    });
  }

  try {
    const foundUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!foundUser || foundUser.role !== 'admin') {
      return res.status(403).json({
        status: 403,
        message: 'Forbidden. Admin access required.',
        data: null,
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  }
};

module.exports = { admin };
