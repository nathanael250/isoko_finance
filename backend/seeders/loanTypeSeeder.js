// Load environment variables first
require('dotenv').config();

const { connectDB } = require('../config/database');
const LoanType = require('../models/LoanType');

const loanTypesData = [
    {
        name: 'Business Loan',
        code: 'BL001',
        description: 'Loan for business expansion and working capital needs',
        category: 'loan',
        cost_of_funds: 0.01,
        operating_cost: 0.0083,
        risk_percentage: 0.0083,
        profit_margin: 0.0123,
        nominal_interest_rate: 3.89,
        min_interest_rate: 3.5,
        max_interest_rate: 4.5,
        interest_calculation_method: 'reducing_balance',
        application_fee_type: 'percentage',
        application_fee_rate: 0.02,
        disbursement_fee_type: 'percentage',
        disbursement_fee_rate: 0.01,
        management_fee_rate: 0.02,
        risk_premium_fee_rate: 0.015,
        late_payment_fee_rate: 0.07,
        late_payment_fee_type: 'daily',
        vat_applicable: true,
        vat_rate: 0.18,
        min_term_months: 6,
        max_term_months: 60,
        min_amount: 100000,
        max_amount: 50000000,
        allowed_frequencies: ['monthly', 'quarterly'],
        default_frequency: 'monthly',
        requires_collateral: true,
        requires_guarantor: true,
        currency: 'RWF',
        is_active: true,
        is_visible_to_clients: true,
        documentation_required: ['business_license', 'financial_statements', 'tax_returns']
    },
    {
        name: 'Contract Finance Loan',
        code: 'CFL001',
        description: 'Financing for contract execution and fulfillment',
        category: 'loan',
        cost_of_funds: 0.01,
        operating_cost: 0.0083,
        risk_percentage: 0.01,
        profit_margin: 0.015,
        nominal_interest_rate: 4.33,
        min_interest_rate: 4.0,
        max_interest_rate: 5.0,
        interest_calculation_method: 'reducing_balance',
        application_fee_type: 'percentage',
        application_fee_rate: 0.025,
        disbursement_fee_type: 'percentage',
        disbursement_fee_rate: 0.015,
        management_fee_rate: 0.025,
        risk_premium_fee_rate: 0.02,
        late_payment_fee_rate: 0.07,
        late_payment_fee_type: 'daily',
        vat_applicable: true,
        vat_rate: 0.18,
        min_term_months: 3,
        max_term_months: 24,
        min_amount: 500000,
        max_amount: 100000000,
        allowed_frequencies: ['monthly'],
        default_frequency: 'monthly',
        requires_collateral: true,
        requires_guarantor: true,
        currency: 'RWF',
        is_active: true,
        is_visible_to_clients: true,
        documentation_required: ['contract_document', 'business_license', 'bank_statements']
    },
    {
        name: 'Personal Loan',
        code: 'PL001',
        description: 'Personal financing for individual needs',
        category: 'loan',
        cost_of_funds: 0.01,
        operating_cost: 0.01,
        risk_percentage: 0.015,
        profit_margin: 0.02,
        nominal_interest_rate: 5.5,
        min_interest_rate: 5.0,
        max_interest_rate: 6.0,
        interest_calculation_method: 'reducing_balance',
        application_fee_type: 'percentage',
        application_fee_rate: 0.03,
        disbursement_fee_type: 'fixed_amount', // Changed from 'fixed' to 'fixed_amount'
        disbursement_fee_fixed: 5000,
        management_fee_rate: 0.015,
        risk_premium_fee_rate: 0.01,
        late_payment_fee_rate: 0.05,
        late_payment_fee_type: 'daily',
        vat_applicable: true,
        vat_rate: 0.18,
        min_term_months: 3,
        max_term_months: 36,
        min_amount: 50000,
        max_amount: 5000000,
        allowed_frequencies: ['monthly'],
        default_frequency: 'monthly',
        requires_collateral: false,
        requires_guarantor: true,
        currency: 'RWF',
        is_active: true,
        is_visible_to_clients: true,
        documentation_required: ['national_id', 'salary_slip', 'bank_statements']
    },
    {
        name: 'Daily Finance Loan (Immovable Assets)',
        code: 'DFL-IA001',
        description: 'Short-term financing secured by immovable assets',
        category: 'loan',
        cost_of_funds: 0.008,
        operating_cost: 0.012,
        risk_percentage: 0.008,
        profit_margin: 0.017,
        nominal_interest_rate: 4.5,
        min_interest_rate: 4.0,
        max_interest_rate: 5.5,
        interest_calculation_method: 'reducing_balance',
        application_fee_type: 'percentage',
        application_fee_rate: 0.02,
        disbursement_fee_type: 'percentage',
        disbursement_fee_rate: 0.01,
        management_fee_rate: 0.02,
        risk_premium_fee_rate: 0.01,
        late_payment_fee_rate: 0.1,
        late_payment_fee_type: 'daily',
        vat_applicable: true,
        vat_rate: 0.18,
        min_term_days: 30,
        max_term_days: 365,
        min_amount: 100000,
        max_amount: 20000000,
        allowed_frequencies: ['daily', 'weekly', 'monthly'],
        default_frequency: 'monthly',
        requires_collateral: true,
        requires_guarantor: false,
        currency: 'RWF',
        is_active: true,
        is_visible_to_clients: true,
        documentation_required: ['property_title', 'valuation_report', 'national_id']
    },
    {
        name: 'Daily Finance Loan (Movable Assets)',
        code: 'DFL-MA001',
        description: 'Short-term financing secured by movable assets',
        category: 'loan',
        cost_of_funds: 0.008,
        operating_cost: 0.015,
        risk_percentage: 0.012,
        profit_margin: 0.02,
        nominal_interest_rate: 5.5,
        min_interest_rate: 5.0,
        max_interest_rate: 6.5,
        interest_calculation_method: 'reducing_balance',
        application_fee_type: 'percentage',
        application_fee_rate: 0.025,
        disbursement_fee_type: 'percentage',
        disbursement_fee_rate: 0.015,
        management_fee_rate: 0.025,
        risk_premium_fee_rate: 0.015,
        late_payment_fee_rate: 0.1,
        late_payment_fee_type: 'daily',
        vat_applicable: true,
        vat_rate: 0.18,
        min_term_days: 30,
        max_term_days: 180,
        min_amount: 50000,
        max_amount: 10000000,
        allowed_frequencies: ['daily', 'weekly', 'monthly'],
        default_frequency: 'weekly',
        requires_collateral: true,
        requires_guarantor: true,
        currency: 'RWF',
        is_active: true,
        is_visible_to_clients: true,
        documentation_required: ['asset_valuation', 'ownership_proof', 'national_id']
    },
    {
        name: 'Bid Security',
        code: 'BS001',
        description: 'Guarantee for tender bid security',
        category: 'guarantee',
        cost_of_funds: 0.005,
        operating_cost: 0.008,
        risk_percentage: 0.005,
        profit_margin: 0.012,
        nominal_interest_rate: 3.0,
        min_interest_rate: 2.5,
        max_interest_rate: 3.5,
        interest_calculation_method: 'flat',
        application_fee_type: 'percentage',
        application_fee_rate: 0.015,
        disbursement_fee_type: 'percentage',
        disbursement_fee_rate: 0.005,
        management_fee_rate: 0.01,
        risk_premium_fee_rate: 0.005,
        late_payment_fee_rate: 0.05,
        late_payment_fee_type: 'daily',
        vat_applicable: true,
        vat_rate: 0.18,
        min_term_days: 30,
        max_term_days: 365,
        min_amount: 100000,
        max_amount: 50000000,
        allowed_frequencies: ['lump_sum'],
        default_frequency: 'lump_sum', // This will work after updating the model
        requires_collateral: true,
        requires_guarantor: false,
        currency: 'RWF',
        is_active: true,
        is_visible_to_clients: true,
        documentation_required: ['tender_document', 'business_license', 'financial_statements']
    },
    {
        name: 'Performance Guarantee',
        code: 'PG001',
        description: 'Guarantee for contract performance',
        category: 'guarantee',
        cost_of_funds: 0.005,
        operating_cost: 0.01,
        risk_percentage: 0.008,
        profit_margin: 0.015,
        nominal_interest_rate: 3.8,
        min_interest_rate: 3.5,
        max_interest_rate: 4.5,
        interest_calculation_method: 'flat',
        application_fee_type: 'percentage',
        application_fee_rate: 0.02,
        disbursement_fee_type: 'percentage',
        disbursement_fee_rate: 0.01,
        management_fee_rate: 0.015,
        risk_premium_fee_rate: 0.01,
        late_payment_fee_rate: 0.05,
        late_payment_fee_type: 'daily',
        vat_applicable: true,
        vat_rate: 0.18,
        min_term_days: 90,
        max_term_days: 1095,
        min_amount: 500000,
        max_amount: 100000000,
        allowed_frequencies: ['lump_sum'],
        default_frequency: 'lump_sum', // This will work after updating the model
        requires_collateral: true,
        requires_guarantor: false,
        currency: 'RWF',
        is_active: true,
        is_visible_to_clients: true,
        documentation_required: ['contract_document', 'business_license', 'bank_statements']
    },
    {
        name: 'Advance Payment Guarantee',
        code: 'APG001',
        description: 'Guarantee for advance payment protection',
        category: 'guarantee',
        cost_of_funds: 0.005,
        operating_cost: 0.008,
        risk_percentage: 0.007,
        profit_margin: 0.013,
        nominal_interest_rate: 3.3,
        min_interest_rate: 3.0,
        max_interest_rate: 4.0,
        interest_calculation_method: 'flat',
        application_fee_type: 'percentage',
        application_fee_rate: 0.018,
        disbursement_fee_type: 'percentage',
        disbursement_fee_rate: 0.008,
        management_fee_rate: 0.012,
        risk_premium_fee_rate: 0.008,
        late_payment_fee_rate: 0.05,
        late_payment_fee_type: 'daily',
        vat_applicable: true,
        vat_rate: 0.18,
        min_term_days: 60,
        max_term_days: 730,
        min_amount: 200000,
        max_amount: 75000000,
        allowed_frequencies: ['lump_sum'],
        default_frequency: 'lump_sum', // This will work after updating the model
        requires_collateral: true,
        requires_guarantor: false,
        currency: 'RWF',
        is_active: true,
        is_visible_to_clients: true,
        documentation_required: ['contract_document', 'advance_payment_request', 'business_license']
    }
];

const seedLoanTypes = async () => {
    try {
        console.log('🌱 Seeding loan types...');
        console.log('📊 Environment check:');
        console.log(`   DB_HOST: ${process.env.DB_HOST || 'not set'}`);
        console.log(`   DB_NAME: ${process.env.DB_NAME || 'not set'}`);
        console.log(`   DB_USER: ${process.env.DB_USER || 'not set'}`);

        // Ensure database connection
        await connectDB();
        console.log('✅ Database connected successfully');

        // Remove the LoanType.sync() call - it's handled by connectDB()
        console.log('✅ Model synchronization handled by database connection');

        let createdCount = 0;
        let skippedCount = 0;

        for (const loanTypeData of loanTypesData) {
            try {
                // Check if loan type already exists
                const existingLoanType = await LoanType.findOne({
                    where: { code: loanTypeData.code }
                });

                if (existingLoanType) {
                    console.log(`⏭️  Skipped: ${loanTypeData.name} (already exists)`);
                    skippedCount++;
                    continue;
                }

                // Create new loan type
                await LoanType.create(loanTypeData);
                console.log(`✅ Created loan type: ${loanTypeData.name}`);
                createdCount++;

            } catch (error) {
                console.error(`❌ Error creating loan type ${loanTypeData.name}:`, error.message);
            }
        }

        console.log(`\n📊 Seeding Summary:`);
        console.log(`   ✅ Created: ${createdCount} loan types`);
        console.log(`   ⏭️  Skipped: ${skippedCount} loan types`);
        console.log(`🎉 Loan types seeding completed!`);

    } catch (error) {
        console.error('❌ Error seeding loan types:', error);
        throw error;
    }
};

// Allow direct execution
if (require.main === module) {
    seedLoanTypes()
        .then(() => {
            console.log('✅ Seeder completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seeder failed:', error);
            process.exit(1);
        });
}

module.exports = {
    seedLoanTypes,
    loanTypesData
};
