const { DataTypes } = require('sequelize');

const defineGuarantorFileModel = (sequelize) => {
    const GuarantorFile = sequelize.define('GuarantorFile', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        guarantor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'guarantors',
                key: 'id'
            }
        },
        file_type: {
            type: DataTypes.ENUM(
                'national_id',
                'passport',
                'drivers_license',
                'utility_bill',
                'bank_statement',
                'salary_slip',
                'employment_letter',
                'business_registration',
                'tax_certificate',
                'property_document',
                'guarantor_form',
                'signature_specimen',
                'other'
            ),
            allowNull: false
        },
        file_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        original_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        file_path: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        file_size: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'File size in bytes'
        },
        mime_type: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        file_extension: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        verification_notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        expiry_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: 'For documents with expiry dates'
        },
        document_number: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Document reference number if applicable'
        },
        uploaded_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        verified_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        verified_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'guarantor_files',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['guarantor_id']
            },
            {
                fields: ['file_type']
            },
            {
                fields: ['is_verified']
            },
            {
                fields: ['uploaded_by']
            }
        ]
    });

    return GuarantorFile;
};

module.exports = defineGuarantorFileModel;
