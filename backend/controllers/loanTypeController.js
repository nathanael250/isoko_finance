const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const LoanType = require('../models/LoanType');
const User = require('../models/User');

// @desc    Get all loan types
// @route   GET /api/loan-types
// @access  Private
const getLoanTypes = async (req, res) => {
  try {
    console.log('=== LOAN TYPES REQUEST DEBUG ===');
    console.log('Query params:', req.query);
    console.log('User:', req.user?.id);
    
    const { 
      page = 1, 
      limit = 10, 
      category, 
      is_active, 
      is_visible_to_clients,
      search 
    } = req.query;

    console.log('Parsed params:', { page, limit, category, is_active, is_visible_to_clients, search });

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (category) where.category = category;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (is_visible_to_clients !== undefined) where.is_visible_to_clients = is_visible_to_clients === 'true';
    
    // Fixed search logic for MySQL
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    console.log('Where clause:', JSON.stringify(where, null, 2));
    console.log('Limit:', parseInt(limit), 'Offset:', parseInt(offset));

    const { count, rows } = await LoanType.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
          required: false
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'first_name', 'last_name'],
          required: false
        }
      ]
    });

    console.log(`Found ${count} loan types.`);
    console.log('=== END DEBUG ===');
    
    res.status(200).json({
      success: true,
      data: {
        loan_types: rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('=== LOAN TYPES ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('SQL Error:', error.sql);
    console.error('Original error:', error.original);
    console.error('=== END ERROR ===');
    
    res.status(500).json({
      success: false,
      message: 'Error fetching loan types',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// @desc    Get single loan type
// @route   GET /api/loan-types/:id
// @access  Private
const getLoanType = async (req, res) => {
  try {
    const { id } = req.params;

    const loanType = await LoanType.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
          required: false
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'first_name', 'last_name'],
          required: false
        }
      ]
    });

    if (!loanType) {
      return res.status(404).json({
        success: false,
        message: 'Loan type not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { loan_type: loanType }
    });

  } catch (error) {
    console.error('Get loan type error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loan type',
      error: error.message
    });
  }
};

// @desc    Create new loan type
// @route   POST /api/loan-types
// @access  Private (Admin only)
const createLoanType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if code or name already exists
    const existingLoanType = await LoanType.findOne({
      where: {
        [Op.or]: [
          { code: req.body.code },
          { name: req.body.name }
        ]
      }
    });

    if (existingLoanType) {
      return res.status(400).json({
        success: false,
        message: 'Loan type with this code or name already exists'
      });
    }

    // Calculate nominal interest rate from components
    const {
      cost_of_funds = 0.01,
      operating_cost = 0.0083,
      risk_percentage = 0.0083,
      profit_margin = 0.0123
    } = req.body;

    const calculatedNominalRate = (cost_of_funds + operating_cost + risk_percentage + profit_margin) * 100;

    const loanTypeData = {
      ...req.body,
      nominal_interest_rate: req.body.nominal_interest_rate || calculatedNominalRate,
      created_by: req.user.id
    };

    const loanType = await LoanType.create(loanTypeData);

    res.status(201).json({
      success: true,
      message: 'Loan type created successfully',
      data: { loan_type: loanType }
    });

  } catch (error) {
    console.error('Create loan type error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating loan type',
      error: error.message
    });
  }
};

// @desc    Update loan type
// @route   PUT /api/loan-types/:id
// @access  Private (Admin only)
const updateLoanType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const loanType = await LoanType.findByPk(id);
    if (!loanType) {
      return res.status(404).json({
        success: false,
        message: 'Loan type not found'
      });
    }

    // Check if code or name already exists (excluding current record)
    if (req.body.code || req.body.name) {
      const existingLoanType = await LoanType.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [
            ...(req.body.code ? [{ code: req.body.code }] : []),
            ...(req.body.name ? [{ name: req.body.name }] : [])
          ]
        }
      });

      if (existingLoanType) {
        return res.status(400).json({
          success: false,
          message: 'Loan type with this code or name already exists'
        });
      }
    }

    // Recalculate nominal interest rate if components are updated
    if (req.body.cost_of_funds || req.body.operating_cost || req.body.risk_percentage || req.body.profit_margin) {
      const cost_of_funds = req.body.cost_of_funds || loanType.cost_of_funds;
      const operating_cost = req.body.operating_cost || loanType.operating_cost;
      const risk_percentage = req.body.risk_percentage || loanType.risk_percentage;
      const profit_margin = req.body.profit_margin || loanType.profit_margin;

      req.body.nominal_interest_rate = (cost_of_funds + operating_cost + risk_percentage + profit_margin) * 100;
    }

    const updateData = {
      ...req.body,
      updated_by: req.user.id
    };

    await loanType.update(updateData);

    const updatedLoanType = await LoanType.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
          required: false
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'first_name', 'last_name'],
          required: false
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Loan type updated successfully',
      data: { loan_type: updatedLoanType }
    });

  } catch (error) {
    console.error('Update loan type error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating loan type',
      error: error.message
    });
  }
};

// @desc    Delete loan type
// @route   DELETE /api/loan-types/:id
// @access  Private (Admin only)
const deleteLoanType = async (req, res) => {
  try {
    const { id } = req.params;

    const loanType = await LoanType.findByPk(id);
    if (!loanType) {
      return res.status(404).json({
        success: false,
        message: 'Loan type not found'
      });
    }

    // Check if loan type is being used by any loans
    // Note: We'll skip this check for now since Loan model might not exist yet
    // const Loan = require('../models/Loan');
    // const loansCount = await Loan.count({
    //   where: { loan_type_id: id }
    // });

    // if (loansCount > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Cannot delete loan type. It is being used by ${loansCount} loan(s). Consider deactivating instead.`
    //   });
    // }

    await loanType.destroy();

    res.status(200).json({
      success: true,
      message: 'Loan type deleted successfully'
    });

  } catch (error) {
    console.error('Delete loan type error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting loan type',
      error: error.message
    });
  }
};

// @desc    Calculate loan preview
// @route   POST /api/loan-types/:id/calculate
// @access  Private
const calculateLoanPreview = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, term_days, term_months, frequency, collateral_value } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required for calculation'
      });
    }

    const loanType = await LoanType.findByPk(id);
    if (!loanType) {
      return res.status(404).json({
        success: false,
        message: 'Loan type not found'
      });
    }

    if (!loanType.is_active) {
      return res.status(400).json({
        success: false,
        message: 'This loan type is not active'
      });
    }

    // Basic validation
    if (loanType.min_amount && amount < loanType.min_amount) {
      return res.status(400).json({
        success: false,
        message: `Amount must be at least ${loanType.currency} ${loanType.min_amount.toLocaleString()}`
      });
    }

    if (loanType.max_amount && amount > loanType.max_amount) {
      return res.status(400).json({
        success: false,
        message: `Amount cannot exceed ${loanType.currency} ${loanType.max_amount.toLocaleString()}`
      });
    }

    // Calculate fees (simplified version)
    let applicationFee = 0;
    if (loanType.application_fee_type === 'percentage') {
      applicationFee = amount * (loanType.application_fee_rate || 0);
    } else {
      applicationFee = loanType.application_fee_fixed || 0;
    }

    let disbursementFee = 0;
    if (loanType.disbursement_fee_type === 'percentage') {
      disbursementFee = amount * (loanType.disbursement_fee_rate || 0);
    } else {
      disbursementFee = loanType.disbursement_fee_fixed || 0;
    }

    const managementFee = amount * (loanType.management_fee_rate || 0);
    const riskPremiumFee = amount * (loanType.risk_premium_fee_rate || 0);

    const totalFeesBeforeVAT = applicationFee + disbursementFee + managementFee + riskPremiumFee;
    const vatAmount = loanType.vat_applicable ? totalFeesBeforeVAT * (loanType.vat_rate || 0) : 0;
    const totalFeesIncludingVAT = totalFeesBeforeVAT + vatAmount;

    // Calculate loan schedule
    const termInDays = term_days || (term_months * 30) || loanType.fixed_term_days || 365;
    const termInMonths = term_months || Math.ceil(termInDays / 30);
    const repaymentFreq = frequency || loanType.default_frequency || 'monthly';

    let totalInstallments = 0;
    switch (repaymentFreq) {
      case 'daily':
        totalInstallments = termInDays;
        break;
      case 'weekly':
        totalInstallments = Math.ceil(termInDays / 7);
        break;
      case 'bi_weekly':
        totalInstallments = Math.ceil(termInDays / 14);
        break;
      case 'monthly':
        totalInstallments = termInMonths;
        break;
      case 'quarterly':
        totalInstallments = Math.ceil(termInMonths / 3);
        break;
      default:
        totalInstallments = termInMonths;
    }

    // Calculate installment amount using reducing balance
    const monthlyRate = (loanType.nominal_interest_rate || 0) / 100 / 12;
    const periodicRate = monthlyRate * (termInMonths / totalInstallments);

    let installmentAmount;
    if (periodicRate > 0) {
      installmentAmount = amount *
        (periodicRate * Math.pow(1 + periodicRate, totalInstallments)) /
        (Math.pow(1 + periodicRate, totalInstallments) - 1);
    } else {
      installmentAmount = amount / totalInstallments;
    }

    const totalRepayment = installmentAmount * totalInstallments;
    const totalInterest = totalRepayment - amount;

    // Calculate maturity date
    const today = new Date();
    const maturityDate = new Date(today);
    maturityDate.setDate(today.getDate() + termInDays);

    const calculations = {
      fees: {
        application_fee: Math.round(applicationFee * 100) / 100,
        disbursement_fee: Math.round(disbursementFee * 100) / 100,
        management_fee: Math.round(managementFee * 100) / 100,
        risk_premium_fee: Math.round(riskPremiumFee * 100) / 100,
        total_fees_before_vat: Math.round(totalFeesBeforeVAT * 100) / 100,
        vat_amount: Math.round(vatAmount * 100) / 100,
        total_fees_including_vat: Math.round(totalFeesIncludingVAT * 100) / 100
      },
      loan_details: {
        principal_amount: amount,
        interest_rate: loanType.nominal_interest_rate,
        term_days: termInDays,
        term_months: termInMonths,
        repayment_frequency: repaymentFreq,
        total_installments: totalInstallments,
        installment_amount: Math.round(installmentAmount * 100) / 100,
        total_interest: Math.round(totalInterest * 100) / 100,
        total_repayment: Math.round(totalRepayment * 100) / 100,
        maturity_date: maturityDate.toISOString().split('T')[0],
        net_disbursement: amount - totalFeesIncludingVAT
      }
    };

    res.status(200).json({
      success: true,
      data: { calculations }
    });

  } catch (error) {
    console.error('Calculate loan preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating loan preview',
      error: error.message
    });
  }
};

// @desc    Get active loan types for client applications
// @route   GET /api/loan-types/active
// @access  Private
const getActiveLoanTypes = async (req, res) => {
  try {
    const loanTypes = await LoanType.findAll({
      where: {
        is_active: true,
        is_visible_to_clients: true
      },
      attributes: [
        'id', 'name', 'code', 'description', 'category',
        'nominal_interest_rate', 'min_amount', 'max_amount',
        'min_term_days', 'max_term_days', 'min_term_months', 'max_term_months',
        'fixed_term_days', 'allowed_frequencies', 'default_frequency',
        'requires_collateral', 'requires_guarantor', 'currency'
      ],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: { loan_types: loanTypes }
    });

  } catch (error) {
    console.error('Get active loan types error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active loan types',
      error: error.message
    });
  }
};

module.exports = {
  getLoanTypes,
  getLoanType,
  createLoanType,
  updateLoanType,
  deleteLoanType,
  calculateLoanPreview,
  getActiveLoanTypes
};
