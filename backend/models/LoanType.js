const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User'); // Import the User model

const defineLoanTypeModel = (sequelize) => {
    const LoanType = sequelize.define('LoanType', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        category: {
            type: DataTypes.ENUM('loan', 'guarantee', 'finance'),
            defaultValue: 'loan'
        },

        // Interest Structure
        cost_of_funds: {
            type: DataTypes.DECIMAL(5, 4),
            defaultValue: 0.01,
            comment: 'Cost of funds percentage (e.g., 0.01 = 1%)'
        },
        operating_cost: {
            type: DataTypes.DECIMAL(5, 4),
            defaultValue: 0.0083,
            comment: 'Operating cost percentage (e.g., 0.0083 = 0.83%)'
        },
        risk_percentage: {
            type: DataTypes.DECIMAL(5, 4),
            defaultValue: 0.0083,
            comment: 'Risk percentage (e.g., 0.0083 = 0.83%)'
        },
        profit_margin: {
            type: DataTypes.DECIMAL(5, 4),
            defaultValue: 0.0123,
            comment: 'Profit margin percentage (e.g., 0.0123 = 1.23%)'
        },
        nominal_interest_rate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            comment: 'Total nominal interest rate (e.g., 3.90 = 3.9%)'
        },
        min_interest_rate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: 'Minimum interest rate for variable rate loans'
        },
        max_interest_rate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: 'Maximum interest rate for variable rate loans'
        },
        interest_calculation_method: {
            type: DataTypes.ENUM('flat', 'reducing_balance', 'compound'),
            defaultValue: 'reducing_balance'
        },

        // Fee Structure (all rates are before VAT)
        application_fee_type: {
            type: DataTypes.ENUM('percentage', 'fixed_amount'),
            defaultValue: 'percentage'
        },
        application_fee_rate: {
            type: DataTypes.DECIMAL(5, 4),
            allowNull: true,
            comment: 'Application fee as percentage (e.g., 0.01 = 1%)'
        },
        application_fee_fixed: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            comment: 'Fixed application fee amount'
        },

        disbursement_fee_type: {
            type: DataTypes.ENUM('percentage', 'fixed_amount', 'tiered'),
            defaultValue: 'percentage'
        },
        disbursement_fee_rate: {
            type: DataTypes.DECIMAL(5, 4),
            allowNull: true,
            comment: 'Disbursement fee as percentage'
        },
        disbursement_fee_fixed: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            comment: 'Fixed disbursement fee amount'
        },

        // Tiered disbursement fees (for complex fee structures)
        disbursement_fee_tiers: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'JSON array of tiered fee structure: [{min_amount, max_amount, fee}]'
        },

        management_fee_rate: {
            type: DataTypes.DECIMAL(5, 4),
            allowNull: true,
            defaultValue: 0.02,
            comment: 'Management fee as percentage'
        },
        risk_premium_fee_rate: {
            type: DataTypes.DECIMAL(5, 4),
            allowNull: true,
            defaultValue: 0.015,
            comment: 'Risk premium fee as percentage'
        },
        late_payment_fee_rate: {
            type: DataTypes.DECIMAL(5, 4),
            defaultValue: 0.07,
            comment: 'Late payment fee rate (daily)'
        },
        late_payment_fee_type: {
            type: DataTypes.ENUM('daily', 'monthly', 'fixed'),
            defaultValue: 'daily'
        },

        // VAT Configuration
        vat_applicable: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        vat_rate: {
            type: DataTypes.DECIMAL(5, 4),
            defaultValue: 0.18,
            comment: 'VAT rate (e.g., 0.18 = 18%)'
        },

        // Term Limits
        min_term_days: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Minimum loan term in days'
        },
        max_term_days: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Maximum loan term in days'
        },
        min_term_months: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Minimum loan term in months'
        },
        max_term_months: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Maximum loan term in months'
        },
        fixed_term_days: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Fixed term in days (for products with fixed terms)'
        },

        // Amount Limits
        min_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            comment: 'Minimum loan amount'
        },
        max_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            comment: 'Maximum loan amount'
        },

        // Repayment Configuration
        allowed_frequencies: {
            type: DataTypes.JSON,
            defaultValue: ['monthly'],
            comment: 'Array of allowed repayment frequencies'
        },
        default_frequency: {
            type: DataTypes.ENUM('daily', 'weekly', 'bi_weekly', 'monthly', 'quarterly', 'lump_sum'),
            defaultValue: 'monthly'
        },

        // Security/Collateral Requirements
        requires_collateral: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        allowed_collateral_types: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Array of allowed collateral types'
        },
        min_collateral_ratio: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: 'Minimum collateral to loan ratio (e.g., 1.2 = 120%)'
        },

        // Approval Workflow
        requires_approval: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        auto_approve_limit: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            comment: 'Amount below which loans can be auto-approved'
        },
        approval_levels: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'JSON array defining approval hierarchy'
        },

        // Business Rules
        max_loans_per_client: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Maximum number of active loans per client'
        },
        requires_guarantor: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        min_guarantor_income: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },

        // System Configuration
        currency: {
            type: DataTypes.STRING(3),
            defaultValue: 'RWF'
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        is_visible_to_clients: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Whether clients can see this loan type in applications'
        },

        // Additional Configuration
        special_conditions: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Special terms and conditions for this loan type'
        },
        documentation_required: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Array of required documents'
        },

        // Audit fields
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users', key: 'id' }, // Assuming 'users' is your User table name
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users', key: 'id' },
        },
    }, {
        tableName: 'loan_types',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['code'],
                unique: true
            },
            {
                fields: ['name'],
                unique: true
            },
            {
                fields: ['category', 'is_active']
            },
            {
                fields: ['is_active', 'is_visible_to_clients']
            }
        ]
    });

    // Define associations
    LoanType.belongsTo(User, {
        as: 'creator',
        foreignKey: 'created_by',
        onDelete: 'SET NULL',
    });

    LoanType.belongsTo(User, {
        as: 'updater',
        foreignKey: 'updated_by',
        onDelete: 'SET NULL',
    });

    // Instance methods
    LoanType.prototype.calculateFees = function (amount, termDays, termMonths) {
        const calculations = {
            loan_type_id: this.id,
            loan_type_name: this.name,
            applied_amount: amount,
            currency: this.currency
        };

        // Calculate application fee
        if (this.application_fee_type === 'percentage' && this.application_fee_rate) {
            calculations.application_fee = amount * this.application_fee_rate;
        } else if (this.application_fee_type === 'fixed_amount' && this.application_fee_fixed) {
            calculations.application_fee = this.application_fee_fixed;
        } else {
            calculations.application_fee = 0;
        }

        // Calculate disbursement fee
        if (this.disbursement_fee_type === 'percentage' && this.disbursement_fee_rate) {
            calculations.disbursement_fee = amount * this.disbursement_fee_rate;
        } else if (this.disbursement_fee_type === 'fixed_amount' && this.disbursement_fee_fixed) {
            calculations.disbursement_fee = this.disbursement_fee_fixed;
        } else if (this.disbursement_fee_type === 'tiered' && this.disbursement_fee_tiers) {
            // Find appropriate tier
            const tier = this.disbursement_fee_tiers.find(t =>
                amount >= t.min_amount && amount <= t.max_amount
            );
            calculations.disbursement_fee = tier ? tier.fee : 0;
        } else {
            calculations.disbursement_fee = 0;
        }

        // Calculate management fee
        calculations.management_fee = this.management_fee_rate ? amount * this.management_fee_rate : 0;

        // Calculate risk premium fee
        calculations.risk_premium_fee = this.risk_premium_fee_rate ? amount * this.risk_premium_fee_rate : 0;

        // Calculate VAT if applicable
        if (this.vat_applicable) {
            calculations.application_fee_vat = calculations.application_fee * this.vat_rate;
            calculations.disbursement_fee_vat = calculations.disbursement_fee * this.vat_rate;
            calculations.management_fee_vat = calculations.management_fee * this.vat_rate;
            calculations.risk_premium_fee_vat = calculations.risk_premium_fee * this.vat_rate;
        } else {
            calculations.application_fee_vat = 0;
            calculations.disbursement_fee_vat = 0;
            calculations.management_fee_vat = 0;
            calculations.risk_premium_fee_vat = 0;
        }

        // Calculate totals
        calculations.total_fees_before_vat =
            calculations.application_fee +
            calculations.disbursement_fee +
            calculations.management_fee +
            calculations.risk_premium_fee;

        calculations.total_vat =
            calculations.application_fee_vat +
            calculations.disbursement_fee_vat +
            calculations.management_fee_vat +
            calculations.risk_premium_fee_vat;

        calculations.total_fees_including_vat = calculations.total_fees_before_vat + calculations.total_vat;

        return calculations;
    };

    LoanType.prototype.validateLoanParameters = function (amount, termDays, termMonths, frequency, collateralValue) {
        const errors = [];

        // Validate amount
        if (this.min_amount && amount < this.min_amount) {
            errors.push(`Minimum amount is ${this.currency} ${this.min_amount.toLocaleString()}`);
        }
        if (this.max_amount && amount > this.max_amount) {
            errors.push(`Maximum amount is ${this.currency} ${this.max_amount.toLocaleString()}`);
        }

        // Validate term
        if (this.fixed_term_days) {
            if (termDays && termDays !== this.fixed_term_days) {
                errors.push(`This loan type has a fixed term of ${this.fixed_term_days} days`);
            }
        } else {
            if (this.min_term_days && termDays && termDays < this.min_term_days) {
                errors.push(`Minimum term is ${this.min_term_days} days`);
            }
            if (this.max_term_days && termDays && termDays > this.max_term_days) {
                errors.push(`Maximum term is ${this.max_term_days} days`);
            }
            if (this.min_term_months && termMonths && termMonths < this.min_term_months) {
                errors.push(`Minimum term is ${this.min_term_months} months`);
            }
            if (this.max_term_months && termMonths && termMonths > this.max_term_months) {
                errors.push(`Maximum term is ${this.max_term_months} months`);
            }
        }

        // Validate frequency
        if (this.allowed_frequencies && !this.allowed_frequencies.includes(frequency)) {
            errors.push(`Allowed frequencies are: ${this.allowed_frequencies.join(', ')}`);
        }

        // Validate collateral
        if (this.requires_collateral && this.min_collateral_ratio) {
            if (!collateralValue || collateralValue < (amount * this.min_collateral_ratio)) {
                errors.push(`Minimum collateral value required: ${this.currency} ${(amount * this.min_collateral_ratio).toLocaleString()}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    return LoanType;
};

// Create and export the actual model instance
const LoanType = defineLoanTypeModel(sequelize);

module.exports = LoanType;
