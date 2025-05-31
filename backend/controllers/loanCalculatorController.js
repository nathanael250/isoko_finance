const LoanCalculator = require('../models/LoanCalculator');
const { validationResult } = require('express-validator');
const { sequelize } = require('../config/database');


class LoanCalculatorController {
    // Calculate loan (main endpoint)
    static async calculateLoan(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            console.log('🧮 Loan calculation request received');

            const {
                loan_product_id,
                principal_amount,
                loan_release_date,
                interest_method,
                interest_type,
                interest_rate_per_day,
                interest_rate_per_week,
                interest_rate_per_month,
                interest_rate_per_year,
                effective_rate_per_loan,
                primary_rate_period,
                loan_duration_days,
                loan_duration_weeks,
                loan_duration_months,
                loan_duration_years,
                primary_duration_unit,
                repayment_cycle,
                number_of_repayments
            } = req.body;

            // Determine primary interest rate and duration
            let primary_interest_rate, primary_duration;

            // Get primary interest rate based on specified period
            switch (primary_rate_period) {
                case 'daily':
                    primary_interest_rate = interest_rate_per_day;
                    break;
                case 'weekly':
                    primary_interest_rate = interest_rate_per_week;
                    break;
                case 'monthly':
                    primary_interest_rate = interest_rate_per_month;
                    break;
                case 'yearly':
                    primary_interest_rate = interest_rate_per_year;
                    break;
                case 'per_loan':
                    primary_interest_rate = effective_rate_per_loan;
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid primary rate period'
                    });
            }

            // Get primary duration based on specified unit
            switch (primary_duration_unit) {
                case 'days':
                    primary_duration = loan_duration_days;
                    break;
                case 'weeks':
                    primary_duration = loan_duration_weeks;
                    break;
                case 'months':
                    primary_duration = loan_duration_months;
                    break;
                case 'years':
                    primary_duration = loan_duration_years;
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid primary duration unit'
                    });
            }

            if (!primary_interest_rate || !primary_duration) {
                return res.status(400).json({
                    success: false,
                    message: 'Primary interest rate and duration are required'
                });
            }

            // Get loan product info if provided
            let loanProductName = null;
            if (loan_product_id) {
                const [loanTypes] = await sequelize.query(
                    'SELECT name FROM loan_types WHERE id = ? AND is_active = 1',
                    { replacements: [loan_product_id] }
                );
                if (loanTypes.length > 0) {
                    loanProductName = loanTypes[0].name;
                }
            }

            // Prepare calculation parameters
            const calculationParams = {
                principal_amount: parseFloat(principal_amount),
                loan_release_date,
                interest_method,
                interest_type,
                primary_interest_rate: parseFloat(primary_interest_rate),
                primary_rate_period,
                primary_duration: parseFloat(primary_duration),
                primary_duration_unit,
                repayment_cycle,
                number_of_repayments: parseInt(number_of_repayments)
            };

            // Perform calculation
            const calculationResults = LoanCalculator.calculateLoan(calculationParams);

            // Prepare response data
            const responseData = {
                calculation_id: `CALC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                input_parameters: {
                    loan_product_id,
                    loan_product_name: loanProductName,
                    principal_amount: parseFloat(principal_amount),
                    loan_release_date,
                    interest_method,
                    interest_type,
                    interest_rates: {
                        per_day: interest_rate_per_day || null,
                        per_week: interest_rate_per_week || null,
                        per_month: interest_rate_per_month || null,
                        per_year: interest_rate_per_year || null,
                        per_loan: effective_rate_per_loan || null
                    },
                    primary_rate: {
                        rate: primary_interest_rate,
                        period: primary_rate_period
                    },
                    loan_duration: {
                        days: loan_duration_days || null,
                        weeks: loan_duration_weeks || null,
                        months: loan_duration_months || null,
                        years: loan_duration_years || null
                    },
                    primary_duration: {
                        value: primary_duration,
                        unit: primary_duration_unit
                    },
                    repayment_cycle,
                    number_of_repayments: parseInt(number_of_repayments)
                },
                calculation_results: calculationResults,
                calculated_at: new Date().toISOString()
            };

            console.log('✅ Loan calculation completed successfully');

            res.status(200).json({
                success: true,
                message: 'Loan calculation completed successfully',
                data: responseData
            });

        } catch (error) {
            console.error('Loan calculation error:', error);
            res.status(500).json({
                success: false,
                message: 'Error calculating loan',
                error: error.message
            });
        }
    }

    // Quick calculation with preset
    static async quickCalculate(req, res) {
        try {
            const { preset_name, principal_amount, custom_rate } = req.body;

            if (!preset_name || !principal_amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Preset name and principal amount are required'
                });
            }

            const presets = LoanCalculator.getCalculationPresets();
            const preset = presets.find(p => p.name === preset_name);

            if (!preset) {
                return res.status(404).json({
                    success: false,
                    message: 'Preset not found',
                    available_presets: presets.map(p => p.name)
                });
            }

            // Build calculation parameters from preset
            const calculationParams = {
                principal_amount: parseFloat(principal_amount),
                loan_release_date: new Date().toISOString().split('T')[0], // Today
                interest_method: preset.interest_method,
                interest_type: 'fixed',
                primary_interest_rate: custom_rate || preset.interest_rate_per_month || preset.interest_rate_per_week || preset.effective_rate_per_loan,
                primary_rate_period: preset.primary_rate_period,
                primary_duration: preset.loan_duration_months || preset.loan_duration_weeks || preset.loan_duration_days,
                primary_duration_unit: preset.primary_duration_unit,
                repayment_cycle: preset.repayment_cycle,
                number_of_repayments: preset.number_of_repayments
            };

            // Perform calculation
            const calculationResults = LoanCalculator.calculateLoan(calculationParams);

            res.status(200).json({
                success: true,
                message: 'Quick calculation completed',
                data: {
                    preset_used: preset.name,
                    preset_description: preset.description,
                    calculation_results: calculationResults,
                    calculated_at: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Quick calculation error:', error);
            res.status(500).json({
                success: false,
                message: 'Error performing quick calculation',
                error: error.message
            });
        }
    }

    // Compare different scenarios
    static async compareScenarios(req, res) {
        try {
            const { scenarios } = req.body;

            if (!scenarios || !Array.isArray(scenarios) || scenarios.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'At least 2 scenarios are required for comparison'
                });
            }

            if (scenarios.length > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 5 scenarios can be compared at once'
                });
            }

            const comparisons = [];

            for (let i = 0; i < scenarios.length; i++) {
                const scenario = scenarios[i];
                
                try {
                    // Build calculation parameters
                    const calculationParams = {
                        principal_amount: parseFloat(scenario.principal_amount),
                        loan_release_date: scenario.loan_release_date || new Date().toISOString().split('T')[0],
                        interest_method: scenario.interest_method,
                        interest_type: scenario.interest_type || 'fixed',
                        primary_interest_rate: parseFloat(scenario.primary_interest_rate),
                        primary_rate_period: scenario.primary_rate_period,
                        primary_duration: parseFloat(scenario.primary_duration),
                        primary_duration_unit: scenario.primary_duration_unit,
                        repayment_cycle: scenario.repayment_cycle,
                        number_of_repayments: parseInt(scenario.number_of_repayments)
                    };

                    const results = LoanCalculator.calculateLoan(calculationParams);
                    
                    comparisons.push({
                        scenario_name: scenario.scenario_name || `Scenario ${i + 1}`,
                        input_parameters: calculationParams,
                        results: {
                            total_amount: results.total_amount,
                            total_interest: results.total_interest,
                            installment_amount: results.installment_amount,
                            effective_annual_rate: results.effective_annual_rate || 0,
                            maturity_date: results.maturity_date
                        }
                    });

                } catch (error) {
                    comparisons.push({
                        scenario_name: scenario.scenario_name || `Scenario ${i + 1}`,
                        error: `Calculation failed: ${error.message}`
                    });
                }
            }

            // Generate comparison summary
            const validComparisons = comparisons.filter(c => !c.error);
            let comparisonSummary = null;

            if (validComparisons.length >= 2) {
                const totalAmounts = validComparisons.map(c => c.results.total_amount);
                const totalInterests = validComparisons.map(c => c.results.total_interest);
                const installments = validComparisons.map(c => c.results.installment_amount);

                comparisonSummary = {
                    best_total_amount: {
                        scenario: validComparisons.find(c => c.results.total_amount === Math.min(...totalAmounts))?.scenario_name,
                        amount: Math.min(...totalAmounts)
                    },
                    worst_total_amount: {
                        scenario: validComparisons.find(c => c.results.total_amount === Math.max(...totalAmounts))?.scenario_name,
                        amount: Math.max(...totalAmounts)
                    },
                    lowest_installment: {
                        scenario: validComparisons.find(c => c.results.installment_amount === Math.min(...installments))?.scenario_name,
                        amount: Math.min(...installments)
                    },
                    highest_installment: {
                        scenario: validComparisons.find(c => c.results.installment_amount === Math.max(...installments))?.scenario_name,
                        amount: Math.max(...installments)
                    },
                    total_interest_range: {
                        min: Math.min(...totalInterests),
                        max: Math.max(...totalInterests),
                        difference: Math.max(...totalInterests) - Math.min(...totalInterests)
                    }
                };
            }

            res.status(200).json({
                success: true,
                message: 'Scenario comparison completed',
                data: {
                    scenarios: comparisons,
                    comparison_summary: comparisonSummary,
                    compared_at: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Compare scenarios error:', error);
            res.status(500).json({
                success: false,
                message: 'Error comparing scenarios',
                error: error.message
            });
        }
    }

    // Get calculation presets
    static async getCalculationPresets(req, res) {
        try {
            const presets = LoanCalculator.getCalculationPresets();

            res.status(200).json({
                success: true,
                data: {
                    presets,
                    total_presets: presets.length
                }
            });

        } catch (error) {
            console.error('Get presets error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching calculation presets',
                error: error.message
            });
        }
    }

    // Get loan products for dropdown
    static async getLoanProducts(req, res) {
        try {
            const [loanTypes] = await sequelize.query(`
                SELECT 
                    id,
                    name,
                    code,
                    nominal_interest_rate,
                    min_amount,
                    max_amount,
                    min_term_months,
                    max_term_months,
                    allowed_frequencies,
                    interest_calculation_method,
                    description
                FROM loan_types 
                WHERE is_active = 1
                ORDER BY name
            `);

            res.status(200).json({
                success: true,
                data: {
                    loan_products: loanTypes,
                    total_products: loanTypes.length
                }
            });

        } catch (error) {
            console.error('Get loan products error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching loan products',
                error: error.message
            });
        }
    }

    // Calculate payment schedule only
    static async getPaymentSchedule(req, res) {
        try {
            const {
                principal_amount,
                installment_amount,
                total_interest,
                number_of_repayments,
                first_payment_date,
                repayment_cycle,
                interest_method
            } = req.body;

            if (!principal_amount || !installment_amount || !number_of_repayments || !first_payment_date || !repayment_cycle) {
                return res.status(400).json({
                    success: false,
                    message: 'Principal amount, installment amount, number of repayments, first payment date, and repayment cycle are required'
                });
            }

            const schedule = LoanCalculator.generatePaymentSchedule({
                principal_amount: parseFloat(principal_amount),
                installment_amount: parseFloat(installment_amount),
                total_interest: parseFloat(total_interest || 0),
                number_of_repayments: parseInt(number_of_repayments),
                first_payment_date,
                repayment_cycle,
                interest_method: interest_method || 'reducing_balance',
                release_date: new Date(first_payment_date)
            });

            res.status(200).json({
                success: true,
                message: 'Payment schedule generated successfully',
                data: {
                    payment_schedule: schedule,
                    schedule_summary: {
                        total_payments: schedule.length,
                        total_amount: schedule.reduce((sum, payment) => sum + payment.installment_amount, 0),
                        total_principal: schedule.reduce((sum, payment) => sum + payment.principal_amount, 0),
                        total_interest: schedule.reduce((sum, payment) => sum + payment.interest_amount, 0),
                        first_payment_date: schedule[0]?.due_date,
                        last_payment_date: schedule[schedule.length - 1]?.due_date
                    }
                }
            });

        } catch (error) {
            console.error('Get payment schedule error:', error);
            res.status(500).json({
                success: false,
                message: 'Error generating payment schedule',
                error: error.message
            });
        }
    }

    // Calculate effective rates
    static async calculateEffectiveRates(req, res) {
        try {
            const {
                nominal_rate,
                rate_period,
                compounding_frequency,
                loan_duration,
                duration_unit
            } = req.body;

            if (!nominal_rate || !rate_period) {
                return res.status(400).json({
                    success: false,
                    message: 'Nominal rate and rate period are required'
                });
            }

            const rate = parseFloat(nominal_rate);
            
            // Convert to annual rate
            let annualRate;
            switch (rate_period) {
                case 'daily':
                    annualRate = rate * 365;
                    break;
                case 'weekly':
                    annualRate = rate * 52;
                    break;
                case 'monthly':
                    annualRate = rate * 12;
                    break;
                case 'yearly':
                    annualRate = rate;
                    break;
                default:
                    annualRate = rate;
            }

            // Calculate effective rates for different compounding frequencies
            const effectiveRates = {
                nominal_annual_rate: Math.round(annualRate * 10000) / 100, // Convert to percentage
                effective_rates: {
                    daily_compounding: Math.round((Math.pow(1 + annualRate/365, 365) - 1) * 10000) / 100,
                    weekly_compounding: Math.round((Math.pow(1 + annualRate/52, 52) - 1) * 10000) / 100,
                    monthly_compounding: Math.round((Math.pow(1 + annualRate/12, 12) - 1) * 10000) / 100,
                    quarterly_compounding: Math.round((Math.pow(1 + annualRate/4, 4) - 1) * 10000) / 100,
                    annual_compounding: Math.round(annualRate * 10000) / 100
                },
                input_parameters: {
                    nominal_rate: rate,
                    rate_period,
                    compounding_frequency,
                    loan_duration,
                    duration_unit
                }
            };

            res.status(200).json({
                success: true,
                message: 'Effective rates calculated successfully',
                data: effectiveRates
            });

        } catch (error) {
            console.error('Calculate effective rates error:', error);
            res.status(500).json({
                success: false,
                message: 'Error calculating effective rates',
                error: error.message
            });
        }
    }

    // Test endpoint
    static async test(req, res) {
        try {
            res.status(200).json({
                success: true,
                message: 'Loan Calculator routes working',
                timestamp: new Date().toISOString(),
                available_endpoints: [
                    'POST /calculate - Calculate loan with full parameters',
                    'POST /quick-calculate - Quick calculation with presets',
                    'POST /compare-scenarios - Compare multiple loan scenarios',
                    'GET /presets - Get calculation presets/templates',
                    'GET /loan-products - Get available loan products',
                    'POST /payment-schedule - Generate payment schedule only',
                    'POST /effective-rates - Calculate effective interest rates'
                ],
                sample_calculation: {
                    endpoint: 'POST /calculate',
                    sample_payload: {
                        principal_amount: 100000,
                        loan_release_date: '2024-02-01',
                        interest_method: 'reducing_balance',
                        interest_type: 'fixed',
                        interest_rate_per_month: 0.03,
                        primary_rate_period: 'monthly',
                        loan_duration_months: 12,
                        primary_duration_unit: 'months',
                        repayment_cycle: 'monthly',
                        number_of_repayments: 12
                    }
                }
            });

        } catch (error) {
            console.error('Test error:', error);
            res.status(500).json({
                success: false,
                message: 'Error testing loan calculator routes',
                error: error.message
            });
        }
    }
}

module.exports = LoanCalculatorController;
