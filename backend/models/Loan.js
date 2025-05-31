const { DataTypes } = require('sequelize');

const defineLoanModel = (sequelize) => {
    const Loan = sequelize.define('Loan', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        loan_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        loan_account: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true
        },
        client_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        borrower_id: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        loan_type: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        // Application details
        loan_purpose: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        economic_sector: {
            type: DataTypes.ENUM('agriculture', 'manufacturing', 'trade', 'services', 'transport', 'construction', 'education', 'health', 'other'),
            defaultValue: 'other'
        },

        // Amount fields
        applied_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        approved_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        disbursed_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },

        // Interest and calculation fields
        interest_rate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false
        },
        interest_rate_method: {
            type: DataTypes.ENUM('flat', 'reducing_balance', 'compound'),
            defaultValue: 'reducing_balance'
        },

        // Term and repayment
        loan_term_months: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        maturity_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        repayment_frequency: {
            type: DataTypes.ENUM('daily', 'weekly', 'bi_weekly', 'monthly', 'quarterly'),
            defaultValue: 'monthly'
        },

        // Installment calculations
        installment_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        total_installments: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        installments_paid: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        installments_outstanding: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        installments_in_arrears: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        // Balance tracking
        loan_balance: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        principal_balance: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        interest_balance: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        arrears_principal: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        arrears_interest: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },

        // Performance tracking
        performance_class: {
            type: DataTypes.ENUM('performing', 'watch', 'substandard', 'doubtful', 'loss'),
            defaultValue: 'performing'
        },
        arrears_start_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        days_in_arrears: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        // Security/Collateral
        collateral_type: {
            type: DataTypes.ENUM('immovable_assets', 'movable_assets', 'guarantor', 'none'),
            defaultValue: 'none'
        },
        collateral_description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        collateral_value: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },

        // Status and workflow
        status: {
            type: DataTypes.ENUM('pending', 'under_review', 'approved', 'disbursed', 'active', 'completed', 'defaulted', 'rejected', 'written_off'),
            defaultValue: 'pending'
        },

        // Staff assignments
        loan_officer_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        branch: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        approved_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        disbursed_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        // Important dates
        application_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        approval_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        disbursement_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        first_payment_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        last_payment_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },

        // Additional fields
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'loans',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['loan_number'],
                unique: true
            },
            {
                fields: ['loan_account'],
                unique: true
            },
            {
                fields: ['client_id']
            },
            {
                fields: ['loan_type']
            },
            {
                fields: ['status']
            },
            {
                fields: ['loan_officer_id']
            },
            {
                fields: ['performance_class']
            },
            {
                fields: ['application_date']
            },
            {
                fields: ['maturity_date']
            }
        ]
    });

    // Generate loan number
    Loan.generateLoanNumber = async function () {
        try {
            const [results] = await sequelize.query(
                'SELECT loan_number FROM loans ORDER BY id DESC LIMIT 1'
            );

            if (results.length === 0) {
                return 'LN001';
            }

            const lastNumber = results[0].loan_number;
            const numberPart = parseInt(lastNumber.replace('LN', ''));
            const newNumber = numberPart + 1;

            return `LN${newNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            console.error('Error generating loan number:', error);
            return `LN${Date.now().toString().slice(-6)}`;
        }
    };

    // Generate loan account
    Loan.generateLoanAccount = async function () {
        try {
            const [results] = await sequelize.query(
                'SELECT loan_account FROM loans ORDER BY id DESC LIMIT 1'
            );

            if (results.length === 0) {
                return 'ACC001';
            }

            const lastAccount = results[0].loan_account;
            const numberPart = parseInt(lastAccount.replace('ACC', ''));
            const newNumber = numberPart + 1;

            return `ACC${newNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            console.error('Error generating loan account:', error);
            return `ACC${Date.now().toString().slice(-6)}`;
        }
    };

    // Calculate loan details
 Loan.calculateLoanDetails = function (amount, interestRate, termMonths, frequency = 'monthly', method = 'reducing_balance') {
    const monthlyRate = interestRate / 100 / 12;
    const principal = parseFloat(amount);
    const annualRate = parseFloat(interestRate) / 100;
    const months = parseInt(termMonths);

    let installmentAmount = 0;
    let totalInstallments = 0;
    let totalInterest = 0;
    let schedule = []; // Initialize schedule array

    // Calculate based on frequency
    switch (frequency) {
        case 'daily':
            totalInstallments = termMonths * 30; // Approximate
            break;
        case 'weekly':
            totalInstallments = termMonths * 4;
            break;
        case 'bi_weekly':
            totalInstallments = termMonths * 2;
            break;
        case 'monthly':
            totalInstallments = termMonths;
            break;
        case 'quarterly':
            totalInstallments = Math.ceil(termMonths / 3);
            break;
        default:
            totalInstallments = termMonths;
    }

    // Calculate installment amount based on method
    if (method === 'reducing_balance') {
        // Calculate monthly payment using reducing balance method
        const monthlyRate = annualRate / 12;
        installmentAmount = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        
        // Generate schedule
        let remainingBalance = principal;
        const startDate = new Date();
        
        for (let i = 1; i <= months; i++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = installmentAmount - interestPayment;
            remainingBalance = remainingBalance - principalPayment;
            
            // Calculate due date
            const dueDate = new Date(startDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            
            schedule.push({
                installment_number: i,
                due_date: dueDate.toISOString().split('T')[0],
                principal_due: Math.round(principalPayment * 100) / 100,
                interest_due: Math.round(interestPayment * 100) / 100,
                total_due: Math.round(installmentAmount * 100) / 100,
                balance_after: Math.max(0, Math.round(remainingBalance * 100) / 100)
            });
            
            totalInterest += interestPayment;
        }
    } else if (method === 'flat') {
        // Flat rate calculation
        const totalInterestFlat = principal * annualRate * (months / 12);
        const totalAmount = principal + totalInterestFlat;
        installmentAmount = totalAmount / months;
        totalInterest = totalInterestFlat;
        
        // Generate schedule for flat rate
        const principalPerInstallment = principal / months;
        const interestPerInstallment = totalInterestFlat / months;
        let remainingBalance = principal;
        const startDate = new Date();
        
        for (let i = 1; i <= months; i++) {
            remainingBalance = remainingBalance - principalPerInstallment;
            
            const dueDate = new Date(startDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            
            schedule.push({
                installment_number: i,
                due_date: dueDate.toISOString().split('T')[0],
                principal_due: Math.round(principalPerInstallment * 100) / 100,
                interest_due: Math.round(interestPerInstallment * 100) / 100,
                total_due: Math.round(installmentAmount * 100) / 100,
                balance_after: Math.max(0, Math.round(remainingBalance * 100) / 100)
            });
        }
    }

    // Calculate maturity date
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + months);

    return {
        installment_amount: Math.round(installmentAmount * 100) / 100,
        total_installments: months,
        installments_outstanding: months,
        loan_balance: principal,
        principal_balance: principal,
        interest_balance: Math.round(totalInterest * 100) / 100,
        total_interest: Math.round(totalInterest * 100) / 100,
        total_amount: Math.round((principal + totalInterest) * 100) / 100,
        maturity_date: maturityDate.toISOString().split('T')[0],
        schedule: schedule
    };
};

    return Loan;
};

module.exports = defineLoanModel;
