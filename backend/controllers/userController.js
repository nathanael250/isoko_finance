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



// @desc    Get role-based dashboard data
// @route   GET /api/users/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const userRole = req.user.role;
    
    switch (userRole) {
      case 'admin':
        return await getAdminDashboard(req, res);
      case 'supervisor':
        return await getSupervisorDashboard(req, res);
      case 'loan-officer':
        return await getLoanOfficerDashboard(req, res);
      case 'cashier':
        return await getCashierDashboard(req, res);
      default:
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading dashboard',
      error: error.message
    });
  }
};

// @desc    Admin Dashboard - Full system overview
const getAdminDashboard = async (req, res) => {
  try {
    // System overview stats
    const totalUsers = await User.count();
    const totalBorrowers = await Borrower.count();
    const totalLoans = await Loan.count();
    const activeLoans = await Loan.count({ where: { status: 'active' } });
    const pendingLoans = await Loan.count({ where: { status: 'pending' } });
    
    // Financial overview
    const totalLoanAmount = await Loan.sum('amount', { where: { status: 'active' } }) || 0;
    const totalRepaid = await Loan.sum('repaid_amount') || 0;
    const totalOutstanding = totalLoanAmount - totalRepaid;
    
    // User statistics by role
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [User.sequelize.fn('COUNT', User.sequelize.col('role')), 'count']
      ],
      group: ['role'],
      raw: true
    });
    
    // Recent activities
    const recentLoans = await Loan.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Borrower, attributes: ['first_name', 'last_name'] },
        { model: User, as: 'loan_officer', attributes: ['first_name', 'last_name'] }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          total_users: totalUsers,
          total_borrowers: totalBorrowers,
          total_loans: totalLoans,
          active_loans: activeLoans,
          pending_loans: pendingLoans
        },
        financial: {
          total_loan_amount: totalLoanAmount,
          total_repaid: totalRepaid,
          total_outstanding: totalOutstanding
        },
        users_by_role: usersByRole,
        recent_loans: recentLoans
      }
    });
  } catch (error) {
    throw error;
  }
};

// @desc    Supervisor Dashboard - Loan approvals and oversight
const getSupervisorDashboard = async (req, res) => {
  try {
    // Loans pending supervisor approval
    const pendingApprovals = await Loan.findAll({
      where: { status: 'pending_supervisor_approval' },
      include: [
        { model: Borrower, attributes: ['first_name', 'last_name', 'phone_number'] },
        { model: User, as: 'loan_officer', attributes: ['first_name', 'last_name'] }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    // Loans approved by supervisor but pending cashier confirmation
    const pendingCashierConfirmation = await Loan.findAll({
      where: { status: 'pending_cashier_confirmation' },
      include: [
        { model: Borrower, attributes: ['first_name', 'last_name'] },
        { model: User, as: 'loan_officer', attributes: ['first_name', 'last_name'] }
      ]
    });
    
    // Recently approved loans
    const recentlyApproved = await Loan.findAll({
      where: { 
        status: 'active',
        approved_by: req.user.id
      },
      limit: 10,
      order: [['approved_at', 'DESC']],
      include: [
        { model: Borrower, attributes: ['first_name', 'last_name'] }
      ]
    });
    
    // Summary stats
    const totalPendingApprovals = pendingApprovals.length;
    const totalPendingCashier = pendingCashierConfirmation.length;
    const totalApprovedThisMonth = await Loan.count({
      where: {
        approved_by: req.user.id,
        approved_at: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
          pending_approvals: totalPendingApprovals,
          pending_cashier_confirmation: totalPendingCashier,
          approved_this_month: totalApprovedThisMonth
        },
        pending_approvals: pendingApprovals,
        pending_cashier_confirmation: pendingCashierConfirmation,
        recently_approved: recentlyApproved
      }
    });
  } catch (error) {
    throw error;
  }
};

// @desc    Loan Officer Dashboard - Assigned borrowers and loan requests
const getLoanOfficerDashboard = async (req, res) => {
  try {
    // Borrowers assigned to this loan officer
    const assignedBorrowers = await Borrower.findAll({
      where: { assigned_loan_officer: req.user.id },
      include: [
        {
          model: Loan,
          required: false,
          where: { status: { [Op.in]: ['active', 'pending_supervisor_approval'] } }
        }
      ]
    });
    
    // Loan requests made by this officer
    const myLoanRequests = await Loan.findAll({
      where: { requested_by: req.user.id },
      include: [
        { model: Borrower, attributes: ['first_name', 'last_name', 'phone_number'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Active loans under this officer
    const activeLoans = await Loan.findAll({
      where: { 
        requested_by: req.user.id,
        status: 'active'
      },
      include: [
        { model: Borrower, attributes: ['first_name', 'last_name'] }
      ]
    });
    
    // Summary statistics
    const totalAssignedBorrowers = assignedBorrowers.length;
    const totalActiveLoans = activeLoans.length;
    const pendingRequests = await Loan.count({
      where: { 
        requested_by: req.user.id,
        status: { [Op.in]: ['pending_supervisor_approval', 'pending_cashier_confirmation'] }
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
          assigned_borrowers: totalAssignedBorrowers,
          active_loans: totalActiveLoans,
          pending_requests: pendingRequests
        },
        assigned_borrowers: assignedBorrowers,
        loan_requests: myLoanRequests,
        active_loans: activeLoans
      }
    });
  } catch (error) {
    throw error;
  }
};

// @desc    Cashier Dashboard - Loan confirmations and cash management
const getCashierDashboard = async (req, res) => {
  try {
    // Loans pending cashier confirmation (approved by supervisor)
    const pendingConfirmations = await Loan.findAll({
      where: { status: 'pending_cashier_confirmation' },
      include: [
        { model: Borrower, attributes: ['first_name', 'last_name', 'phone_number'] },
        { model: User, as: 'loan_officer', attributes: ['first_name', 'last_name'] },
        { model: User, as: 'supervisor', attributes: ['first_name', 'last_name'] }
      ],
      order: [['approved_at', 'ASC']]
    });
    
    // Recently confirmed loans
    const recentlyConfirmed = await Loan.findAll({
      where: { 
        status: 'active',
        confirmed_by: req.user.id
      },
      limit: 10,
      order: [['confirmed_at', 'DESC']],
      include: [
        { model: Borrower, attributes: ['first_name', 'last_name'] }
      ]
    });
    
    // Calculate total amount pending confirmation
    const totalPendingAmount = await Loan.sum('amount', {
      where: { status: 'pending_cashier_confirmation' }
    }) || 0;
    
    // Total confirmed today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const confirmedToday = await Loan.count({
      where: {
        confirmed_by: req.user.id,
        confirmed_at: { [Op.gte]: todayStart }
      }
    });
    
    const amountConfirmedToday = await Loan.sum('amount', {
      where: {
        confirmed_by: req.user.id,
        confirmed_at: { [Op.gte]: todayStart }
      }
    }) || 0;
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
          pending_confirmations: pendingConfirmations.length,
          total_pending_amount: totalPendingAmount,
          confirmed_today: confirmedToday,
          amount_confirmed_today: amountConfirmedToday
        },
        pending_confirmations: pendingConfirmations,
        recently_confirmed: recentlyConfirmed
      }
    });
  } catch (error) {
    throw error;
  }
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
  getDashboard,
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
};
