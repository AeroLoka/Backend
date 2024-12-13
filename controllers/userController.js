const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { validasiUpdateUser } = require('../validations/userValidation');

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.status(200).json({
      status: '200',
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'Error retrieving users',
      error: error.message,
    });
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({
        status: '400',
        message: 'Email query parameter is required',
        data: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({
        status: '404',
        message: 'User not found',
        data: null,
      });
    }

    return res.status(200).json({
      status: '200',
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'Error retrieving user',
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  const { error } = validasiUpdateUser.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: '400',
      message: error.details[0].message,
      data: null,
    });
  }

  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({
        status: '400',
        message: 'Email query parameter is required',
        data: null,
      });
    }

    const { name, phoneNumber } = req.body;
    const user = await prisma.user.update({
      where: { email: email },
      data: {
        name,
        phoneNumber,
      },
    });
    return res.status(200).json({
      status: '200',
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'Error updating user',
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({
        status: '400',
        message: 'Email query parameter is required',
        data: null,
      });
    }

    await prisma.user.update({
      where: { email: email },
      data: { isActive: false },
    });
    return res.status(200).json({
      status: '200',
      message: 'User deactivated successfully',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'Error deactivating user',
      error: error.message,
    });
  }
};

module.exports = { getAllUsers, getUserByEmail, updateUser, deleteUser };
