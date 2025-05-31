const { Op } = require('sequelize');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Helper function to generate employee ID
const generateEmployeeId = (role) => {
  const rolePrefix = {
    'admin': 'ADM',
    'supervisor': 'SUP',
    'loan-officer': 'LO',
    'cashier': 'CSH'
  };
  
  const prefix = rolePrefix[role] || 'EMP';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}${timestamp}${random}`;
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private
const createUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const {
      first_name,
      last_name,
      email,
      phone_number,
      date_of_birth,
      branch,
      role,
      gender,
      password,
      employee_id
    } = req.body;
    
    // Generate employee_id if not provided
    const finalEmployeeId = employee_id || generateEmployeeId(role);
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { employee_id: finalEmployeeId }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or employee ID already exists'
      });
    }
    
    // Create user
    const user = await User.create({
      first_name,
      last_name,
      email,
      phone_number,
      date_of_birth,
      branch,
      role,
      gender,
      password,
      employee_id: finalEmployeeId,
      created_by: req.user?.id
    });
    
    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: userResponse
      }
    });
    
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'User with this email or employee ID already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// ... rest of your controller functions remain the same
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, branch, search } = req.query;
    
    const whereClause = {};
    
    if (role) {
      whereClause.role = role;
    }
    
    if (branch) {
      whereClause.branch = branch;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { employee_id: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: {
        users: rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_users: count,
          per_page: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { user }
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const allowedUpdates = [
      'first_name', 'last_name', 'email', 'phone_number', 
      'date_of_birth', 'branch', 'role', 'gender', 'is_active'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    await user.update(updates);
    
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await user.destroy();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
};
