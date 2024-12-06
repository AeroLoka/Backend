const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../services/mail');
const crypto = require('crypto');

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

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = Date.now() + 1 * 60 * 1000;
    const hashedPassword = bcrypt.hashSync(password, +process.env.SALT);

    let token;
    try {
      token = jwt.sign({ email, otp, otpExpiresAt }, process.env.JWT_SECRET, { expiresIn: '1m' });
    } catch (err) {
      return res.status(500).json({
        status: '500',
        message: 'Error generating token',
        error: err.message,
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
        isActive: false,
      },
    });

    sendMail(email, 'Your OTP Code', `Your OTP code is ${otp}`);

    return res.status(201).json({
      status: '201',
      message: 'User registered successfully. Please check your email for the OTP.',
      data: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        otpToken: token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'Error registering user',
      error: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { token } = req.query;
    const { otp } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        status: '400',
        message: 'Invalid or expired token',
        error: err.message,
      });
    }

    const { email, otp: decodedOtp, otpExpiresAt } = decoded;

    if (otpExpiresAt < Date.now()) {
      return res.status(400).json({
        status: '400',
        message: 'OTP has expired',
        data: null,
      });
    }

    if (decodedOtp !== otp) {
      return res.status(400).json({
        status: '400',
        message: 'Invalid OTP',
        data: null,
      });
    }

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

    await prisma.user.update({
      where: { email },
      data: { isActive: true },
    });

    return res.status(200).json({
      status: '200',
      message: 'OTP verified successfully. Registration complete.',
      data: { email },
    });
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

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

    if (user.isActive) {
      return res.status(400).json({
        status: '400',
        message: 'User is already active',
        data: null,
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = Date.now() + 1 * 60 * 1000;

    let token;
    try {
      token = jwt.sign({ email, otp, otpExpiresAt }, process.env.JWT_SECRET, { expiresIn: '1m' });
    } catch (err) {
      return res.status(500).json({
        status: '500',
        message: 'Error generating token',
        error: err.message,
      });
    }

    sendMail(email, 'Your OTP Code', `Your new OTP code is ${otp}`);

    return res.status(200).json({
      status: '200',
      message: 'New OTP sent successfully. Please check your email.',
      data: { email, token },
    });
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'Error resending OTP',
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phoneNumber: identifier }],
      },
    });

    if (!user) {
      return res.status(404).json({
        status: '404',
        message: 'invalid credentials',
        data: null,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: '401',
        message: 'Invalid credentials',
        data: null,
      });
    }

    const token = jwt.sign({ email: user.email, name: user.name }, process.env.JWT_SECRET);

    return res.status(200).json({
      status: '200',
      message: 'Login successful',
      data: { email: user.email, name: user.name, token },
    });
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'Error logging in',
      error: error.message,
    });
  }
};

const sendEmailForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'Email not found',
        data: null,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        status: 403,
        message: 'User is not active. Please verify your email first.',
        data: null,
      });
    }

    const token = jwt.sign({ email: user.email, name: user.name }, process.env.JWT_SECRET);
    const subject = 'Password Reset';
    const message = `<div>
      <h3>Please click the link below to reset your password</h3>
      <a href='http://localhost:3000/reset-password'>Reset Password</a>
    </div>`;

    sendMail(email, subject, message);
    return res.status(200).json({
      status: 200,
      message: 'Email sent, please check your email to reset the password',
      data: { token },
    });
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.query;
  const { password, confirm_password } = req.body;

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized',
      data: null,
    });
  }

  if (password !== confirm_password) {
    return res.status(400).json({
      status: 400,
      message: 'Passwords do not match',
      data: null,
    });
  }

  let email;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized',
        data: null,
      });
    }
    email = decoded.email;
    req.user = decoded;
  });

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
        data: null,
      });
    }

    const hashPassword = await bcrypt.hash(password, +process.env.SALT);

    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: hashPassword,
      },
    });

    return res.status(200).json({
      status: 200,
      message: 'Password reset successfully',
      data: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  }
};

const oauthLogin = (req, res) => {
  const token = jwt.sign(
    { id: req.user.id, email: req.user.email, name: req.user.name },
    process.env.JWT_SECRET
  );
  res.json({ name: req.user.name, email: req.user.email, token });
};

module.exports = {
  resetPassword,
  sendEmailForgetPassword,
  register,
  login,
  verifyOtp,
  resendOtp,
  oauthLogin,
};
