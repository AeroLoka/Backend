const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createUser = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        password,
      },
    });
    return res.status(201).json({
      status: '201',
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'Error creating user',
      error: error.message,
    });
  }
};

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

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
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
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, password } = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        phoneNumber,
        password,
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
    const { id } = req.params;
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    return res.status(200).json({
      status: '200',
      message: 'User deleted successfully',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser };
