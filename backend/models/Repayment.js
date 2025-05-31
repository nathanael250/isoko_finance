const { DataTypes } = require('sequelize');

const defineRepaymentModel = (sequelize) => {
    const Repayment = sequelize.define('Repayment', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        loan_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'loans',
                key: 'id'
            }
        },
        schedule_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'loan_schedules',
                key: 'id'
            }
        },
        receipt_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        payment_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        amount_paid: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        principal_paid: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        interest_paid: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        penalty_paid: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        payment_method: {
            type: DataTypes.ENUM('cash', 'bank_transfer', 'mobile_money', 'cheque', 'card'),
            defaultValue: 'cash'
        },
        reference_number: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        received_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'reversed'),
            defaultValue: 'confirmed'
        }
    }, {
        tableName: 'repayments',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['loan_id']
            },
            {
                fields: ['payment_date']
            },
            {
                fields: ['receipt_number'],
                unique: true
            },
            {
                fields: ['status']
            }
        ]
    });

    // Generate receipt number
    Repayment.generateReceiptNumber = async function () {
        try {
            const lastRepayment = await this.findOne({
                order: [['id', 'DESC']],
                attributes: ['receipt_number']
            });

            if (!lastRepayment) {
                return 'RPT001';
            }

            const lastNumber = lastRepayment.receipt_number;
            const numberPart = parseInt(lastNumber.replace('RPT', ''));
            const newNumber = numberPart + 1;

            return `RPT${newNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            console.error('Error generating receipt number:', error);
            return `RPT${Date.now().toString().slice(-6)}`;
        }
    };

    return Repayment;
};

module.exports = defineRepaymentModel;
