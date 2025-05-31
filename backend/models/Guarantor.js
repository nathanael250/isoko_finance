const { DataTypes } = require('sequelize');

const defineGuarantorModel = (sequelize) => {
    const Guarantor = sequelize.define('Guarantor', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        guarantor_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            comment: 'Auto-generated guarantor reference number'
        },

        // Personal Information
        country: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: 'Rwanda'
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
        title: {
            type: DataTypes.ENUM('Mr', 'Mrs', 'Miss', 'Dr', 'Prof', 'Chief', 'Alhaji', 'Alhaja', 'Rev', 'Pastor', 'Imam'),
            allowNull: true
        },
        gender: {
            type: DataTypes.ENUM('male', 'female', 'other'),
            allowNull: false
        },
        date_of_birth: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },

        // Business Information
        business_name: {
            type: DataTypes.STRING(200),
            allowNull: true,
            comment: 'Business or company name if applicable'
        },

        // Unique Identifiers
        unique_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Unique name or alias'
        },
        unique_number: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: 'National ID, BVN, NIN, or other unique identifier'
        },

        // Contact Information
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: 'Primary phone number'
        },
        phone_secondary: {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: 'Secondary phone number'
        },

        // Address Information
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: 'Full residential address'
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        province: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Province or state'
        },
        zipcode: {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: 'Postal/ZIP code'
        },

        // Employment Information
        working_status: {
            type: DataTypes.ENUM('employed', 'self_employed', 'unemployed', 'student', 'retired', 'business_owner'),
            allowNull: false,
            defaultValue: 'employed'
        },
        occupation: {
            type: DataTypes.STRING(100),
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
        monthly_income: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            comment: 'Monthly income in local currency'
        },
        income_source: {
            type: DataTypes.STRING(200),
            allowNull: true,
            comment: 'Source of income description'
        },

        // Financial Information
        net_worth: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            comment: 'Estimated net worth'
        },
        bank_name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        bank_account_number: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        bank_branch: {
            type: DataTypes.STRING(100),
            allowNull: true
        },

        // Guarantor Photo
        guarantor_photo: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Path to guarantor photo file'
        },
        photo_uploaded_at: {
            type: DataTypes.DATE,
            allowNull: true
        },

        // Description and Notes
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Additional notes about the guarantor'
        },
        internal_notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Internal staff notes (not visible to guarantor)'
        },

        // LOAN RELATIONSHIP FIELDS
        // Primary loan being guaranteed
        loan_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'loans',
                key: 'id'
            },
            comment: 'Primary loan this guarantor is guaranteeing'
        },
        
        // Borrower relationship
        client_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'clients',
                key: 'id'
            },
            comment: 'Client/borrower being guaranteed'
        },

        // Relationship Information
        relationship_to_borrower: {
            type: DataTypes.ENUM('family', 'friend', 'colleague', 'business_partner', 'spouse', 'parent', 'sibling', 'child', 'relative', 'other'),
            allowNull: true
        },
        relationship_duration: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'How long they have known the borrower'
        },
        relationship_description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Detailed description of relationship'
        },

        // Guarantee Details
        guarantee_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            comment: 'Specific amount being guaranteed for the loan'
        },
        guarantee_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: 'Percentage of loan being guaranteed'
        },
        guarantee_type: {
            type: DataTypes.ENUM('full', 'partial', 'joint', 'several'),
            defaultValue: 'partial',
            comment: 'Type of guarantee provided'
        },
        liability_type: {
            type: DataTypes.ENUM('primary', 'secondary', 'joint_and_several'),
            defaultValue: 'primary',
            comment: 'Guarantor liability type'
        },

        // Guarantee Status and Dates
        guarantee_status: {
            type: DataTypes.ENUM('pending', 'active', 'released', 'defaulted', 'cancelled'),
            defaultValue: 'pending',
            comment: 'Status of the guarantee'
        },
        guarantee_start_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'When guarantee becomes active'
        },
        guarantee_end_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'When guarantee expires'
        },
        guarantee_release_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Date when guarantee was released'
        },
        guarantee_release_reason: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Reason for guarantee release'
        },

        // Consent and Agreement
        guarantor_consent: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether guarantor has given consent'
        },
        consent_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        consent_method: {
            type: DataTypes.ENUM('in_person', 'digital', 'phone', 'email', 'written'),
            allowNull: true
        },
        consent_document_path: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'Path to signed consent document'
        },

        // Guarantee Conditions
        guarantee_conditions: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Special conditions for this guarantee'
        },
        collateral_provided: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether guarantor provided additional collateral'
        },
        collateral_description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        collateral_value: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },

        // Guarantor Status and Verification
        status: {
            type: DataTypes.ENUM('pending', 'verified', 'approved', 'rejected', 'suspended', 'blacklisted'),
            defaultValue: 'pending'
        },
        verification_status: {
            type: DataTypes.ENUM('not_verified', 'documents_submitted', 'under_review', 'verified', 'rejected'),
            defaultValue: 'not_verified'
        },
        verification_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        verification_notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        // Guarantor Capacity (for multiple loans)
        maximum_guarantee_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            comment: 'Maximum total amount this guarantor can guarantee across all loans'
        },
        current_total_guarantee_amount: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            comment: 'Current total amount being guaranteed across all active loans'
        },
        available_guarantee_capacity: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            comment: 'Remaining guarantee capacity'
        },

        // Performance Tracking
        guarantee_performance_rating: {
            type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'defaulted'),
            allowNull: true,
            comment: 'Performance rating based on guarantee history'
        },
        total_loans_guaranteed: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Total number of loans guaranteed (historical)'
        },
        successful_guarantees: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Number of successfully completed guarantees'
        },
        defaulted_guarantees: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Number of guarantees that resulted in default'
        },

        // Staff Assignment and Access Control
        loan_officer_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: 'Loan officer with access to this guarantor'
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
        approved_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        // Audit Fields
        last_contact_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        last_updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        tableName: 'guarantors',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['guarantor_number']
            },
            {
                unique: true,
                fields: ['unique_number']
            },
            {
                fields: ['email']
            },
            {
                fields: ['phone']
            },
            {
                fields: ['status']
            },
            {
                fields: ['verification_status']
            },
            {
                fields: ['guarantee_status']
            },
            {
                fields: ['loan_id']
            },
            {
                fields: ['client_id']
            },
            {
                fields: ['loan_officer_id']
            },
            {
                fields: ['working_status']
            },
            {
                fields: ['country', 'province']
            },
            {
                fields: ['relationship_to_borrower']
            }
        ]
    });

    // Instance methods
    Guarantor.prototype.getFullName = function() {
        const parts = [this.title, this.first_name, this.middle_name, this.last_name].filter(Boolean);
        return parts.join(' ');
    };

    Guarantor.prototype.updateGuaranteeCapacity = function() {
        if (this.maximum_guarantee_amount) {
            this.available_guarantee_capacity = this.maximum_guarantee_amount - this.current_total_guarantee_amount;
        }
        return this.available_guarantee_capacity;
    };

    Guarantor.prototype.canGuarantee = function(amount) {
        if (!this.maximum_guarantee_amount) return false;
        return (this.available_guarantee_capacity || 0) >= amount;
    };

    Guarantor.prototype.activateGuarantee = async function() {
        await this.update({
            guarantee_status: 'active',
            guarantee_start_date: new Date(),
            current_total_guarantee_amount: this.guarantee_amount || 0
        });
        this.updateGuaranteeCapacity();
        return this;
    };

    Guarantor.prototype.releaseGuarantee = async function(reason = null) {
        await this.update({
            guarantee_status: 'released',
            guarantee_release_date: new Date(),
            guarantee_release_reason: reason,
            current_total_guarantee_amount: Math.max(0, this.current_total_guarantee_amount - (this.guarantee_amount || 0))
        });
        this.updateGuaranteeCapacity();
        return this;
    };

    Guarantor.prototype.updatePerformanceRating = function() {
        const totalGuarantees = this.total_loans_guaranteed;
        const successRate = totalGuarantees > 0 ? (this.successful_guarantees / totalGuarantees) * 100 : 0;
        
        if (this.defaulted_guarantees > 0) {
            this.guarantee_performance_rating = 'poor';
        } else if (successRate >= 95) {
            this.guarantee_performance_rating = 'excellent';
        } else if (successRate >= 85) {
            this.guarantee_performance_rating = 'good';
        } else if (successRate >= 70) {
            this.guarantee_performance_rating = 'fair';
        } else {
            this.guarantee_performance_rating = 'poor';
        }
        
        return this.guarantee_performance_rating;
    };

    // Static methods
    Guarantor.generateGuarantorNumber = async function() {
        try {
            const lastGuarantor = await this.findOne({
                order: [['id', 'DESC']],
                attributes: ['guarantor_number']
            });

            if (!lastGuarantor) {
                return 'GRT001';
            }

            const lastNumber = lastGuarantor.guarantor_number;
            const numberPart = parseInt(lastNumber.replace('GRT', ''));
            const newNumber = numberPart + 1;

            return `GRT${newNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            console.error('Error generating guarantor number:', error);
            return `GRT${Date.now().toString().slice(-6)}`;
        }
    };

    Guarantor.findByUniqueNumber = async function(uniqueNumber) {
        return await this.findOne({
            where: { unique_number: uniqueNumber }
        });
    };

    Guarantor.findByPhone = async function(phone) {
        return await this.findOne({
            where: { 
                [sequelize.Sequelize.Op.or]: [
                    { phone: phone },
                    { phone_secondary: phone }
                ]
            }
        });
    };

    Guarantor.findByLoan = async function(loanId) {
        return await this.findAll({
            where: { 
                loan_id: loanId,
                guarantee_status: ['pending', 'active']
            }
        });
    };

    Guarantor.findByClient = async function(clientId) {
        return await this.findAll({
            where: { 
                client_id: clientId,
                guarantee_status: ['pending', 'active']
            }
        });
    };

    Guarantor.findAvailableGuarantors = async function(requiredAmount, loanOfficerId = null) {
        const whereClause = {
            status: 'approved',
            verification_status: 'verified',
            guarantee_status: ['pending', 'active'],
            [sequelize.Sequelize.Op.and]: [
                sequelize.Sequelize.where(
                    sequelize.Sequelize.col('available_guarantee_capacity'),
                    '>=',
                    requiredAmount
                )
            ]
        };

        if (loanOfficerId) {
            whereClause.loan_officer_id = loanOfficerId;
        }

        return await this.findAll({
            where: whereClause,
            order: [['available_guarantee_capacity', 'DESC']]
        });
    };

    return Guarantor;
};

module.exports = defineGuarantorModel;
