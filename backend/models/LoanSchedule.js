const { DataTypes } = require('sequelize');

const defineLoanScheduleModel = (sequelize) => {
    const LoanSchedule = sequelize.define('LoanSchedule', {
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
        installment_number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        due_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        principal_due: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        interest_due: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        total_due: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        balance_after: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        principal_paid: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        interest_paid: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        total_paid: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        payment_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue'),
            defaultValue: 'pending'
        },
        days_overdue: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        penalty_amount: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'loan_schedules',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['loan_id']
            },
            {
                fields: ['due_date']
            },
            {
                fields: ['status']
            },
            {
                fields: ['loan_id', 'installment_number'],
                unique: true
            }
        ]
    });

    return LoanSchedule;
};

module.exports = defineLoanScheduleModel;
