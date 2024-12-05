const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    const userExist = await prisma.user.findUnique({
      where: { email },
    });

    if (userExist) {
      return res.status(400).json({
        status: '400',
        message: 'User already exists',
        data: null,
      });
    }

    const hashedPassword = bcrypt.hashSync(password, +process.env.SALT);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
        isActive: false,
      },
    });

    return res.status(201).json({
      status: '201',
      message: 'User registered successfully',
      data: { name: user.name, email: user.email, phoneNumber: user.phoneNumber },
    });
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'Error registering user',
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        status: '404',
        message: 'User not found',
        data: null,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: '401',
        message: 'Invalid password',
        data: null,
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);

    return res.status(200).json({
      status: '200',
      message: 'Login successful',
      data: { token, id: user.id, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'Error logging in',
      error: error.message,
    });
  }
};


module.exports = { register, login };
