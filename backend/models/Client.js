const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Import sequelize instance

let Client;

const defineClientModel = (sequelizeInstance) => {
    if (Client) return Client;

    Client = sequelizeInstance.define('Client', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        client_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        title: {
            type: DataTypes.ENUM('Mr', 'Mrs', 'Miss', 'Dr', 'Prof', 'Chief', 'Alhaji', 'Alhaja'),
            allowNull: true
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        middle_name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        gender: {
            type: DataTypes.ENUM('male', 'female', 'other'),
            allowNull: false
        },
        date_of_birth: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        unique_number: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'BVN, NIN, or other unique identifier'
        },
        mobile: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        province_state: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        country: {
            type: DataTypes.STRING(100),
            defaultValue: 'Nigeria'
        },
        zipcode: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        business_name: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        working_status: {
            type: DataTypes.ENUM('employed', 'self_employed', 'unemployed', 'student', 'retired'),
            allowNull: true
        },
        occupation: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        monthly_income: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        employer_name: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        employer_address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending_approval'),
            defaultValue: 'pending_approval'
        },
        assigned_officer: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        tableName: 'clients',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['client_number']
            },
            {
                fields: ['email']
            },
            {
                fields: ['mobile']
            },
            {
                fields: ['unique_number']
            },
            {
                fields: ['status']
            }
        ]
    });

    // Add static methods
    Client.findByUniqueNumber = async function (uniqueNumber) {
        try {
            // Use raw query as fallback
            const [results] = await sequelize.query(
                'SELECT * FROM clients WHERE unique_number = ? LIMIT 1',
                { replacements: [uniqueNumber] }
            );
            return results[0] || null;
        } catch (error) {
            console.error('Error finding client by unique number:', error);
            return null;
        }
    };

    Client.findByEmail = async function (email) {
        try {
            const [results] = await sequelize.query(
                'SELECT * FROM clients WHERE email = ? LIMIT 1',
                { replacements: [email] }
            );
            return results[0] || null;
        } catch (error) {
            console.error('Error finding client by email:', error);
            return null;
        }
    };

    Client.findByMobile = async function (mobile) {
        try {
            const [results] = await sequelize.query(
                'SELECT * FROM clients WHERE mobile = ? LIMIT 1',
                { replacements: [mobile] }
            );
            return results[0] || null;
        } catch (error) {
            console.error('Error finding client by mobile:', error);
            return null;
        }
    };

    Client.generateClientNumber = async function () {
        try {
            const [results] = await sequelize.query(
                'SELECT client_number FROM clients ORDER BY id DESC LIMIT 1'
            );

            if (results.length === 0) {
                return 'CLT001';
            }

            const lastNumber = results[0].client_number;
            const numberPart = parseInt(lastNumber.replace('CLT', ''));
            const newNumber = numberPart + 1;

            return `CLT${newNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            console.error('Error generating client number:', error);
            // Fallback to timestamp-based number
            return `CLT${Date.now().toString().slice(-6)}`;
        }
    };

    return Client;
};

// Export the model factory function
module.exports = defineClientModel;
