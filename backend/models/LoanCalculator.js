class LoanCalculator {
    
    // Main calculation method
    static calculateLoan(params) {
        const {
            principal_amount,
            loan_release_date,
            interest_method,
            interest_type,
            primary_interest_rate,
            primary_rate_period,
            primary_duration,
            primary_duration_unit,
            repayment_cycle,
            number_of_repayments
        } = params;

        // Convert everything to consistent units for calculation
        const principal = parseFloat(principal_amount);
        const rate = parseFloat(primary_interest_rate);
        const duration = parseInt(primary_duration);
        const installments = parseInt(number_of_repayments);

        let results = {
            principal_amount: principal,
            number_of_repayments: installments,
            calculation_method_used: `${interest_method}_${primary_rate_period}`,
            input_parameters: params
        };

        // Calculate based on interest method
        switch (interest_method) {
            case 'flat':
                results = { ...results, ...this.calculateFlatRate(principal, rate, duration, installments, primary_rate_period) };
                break;
            case 'reducing_balance':
                results = { ...results, ...this.calculateReducingBalance(principal, rate, duration, installments, primary_rate_period, repayment_cycle) };
                break;
            case 'compound':
                results = { ...results, ...this.calculateCompound(principal, rate, duration, installments, primary_rate_period) };
                break;
            case 'simple':
                results = { ...results, ...this.calculateSimple(principal, rate, duration, installments, primary_rate_period) };
                break;
            default:
                throw new Error('Invalid interest method');
        }

        // Calculate dates
        const releaseDate = new Date(loan_release_date);
        results.first_payment_date = this.calculateFirstPaymentDate(releaseDate, repayment_cycle);
        results.maturity_date = this.calculateMaturityDate(results.first_payment_date, repayment_cycle, installments);

        // Generate payment schedule
        results.payment_schedule = this.generatePaymentSchedule({
            ...results,
            release_date: releaseDate,
            repayment_cycle,
            interest_method
        });

        // Add summary information
        results.loan_summary = this.generateLoanSummary(results);

        return results;
    }

    // Flat rate calculation
    static calculateFlatRate(principal, rate, duration, installments, ratePeriod) {
        let totalInterestRate = rate;
        
        // Convert rate to match loan duration
        switch (ratePeriod) {
            case 'daily':
                totalInterestRate = rate * this.convertDurationToDays(duration, 'months');
                break;
            case 'weekly':
                totalInterestRate = rate * (this.convertDurationToDays(duration, 'months') / 7);
                break;
            case 'monthly':
                totalInterestRate = rate * duration;
                break;
            case 'yearly':
                totalInterestRate = rate * (duration / 12);
                break;
            case 'per_loan':
                totalInterestRate = rate;
                break;
        }

        const totalInterest = principal * totalInterestRate;
        const totalAmount = principal + totalInterest;
        const installmentAmount = totalAmount / installments;
        const principalPerInstallment = principal / installments;
        const interestPerInstallment = totalInterest / installments;

        return {
            total_interest: Math.round(totalInterest * 100) / 100,
            total_amount: Math.round(totalAmount * 100) / 100,
            installment_amount: Math.round(installmentAmount * 100) / 100,
            principal_per_installment: Math.round(principalPerInstallment * 100) / 100,
            interest_per_installment: Math.round(interestPerInstallment * 100) / 100,
            effective_annual_rate: this.calculateEffectiveAnnualRate(totalInterestRate, duration, 'months'),
            total_interest_rate: totalInterestRate
        };
    }

    // Reducing balance calculation
    static calculateReducingBalance(principal, rate, duration, installments, ratePeriod, repaymentCycle) {
        // Convert rate to periodic rate based on repayment cycle
        let periodicRate = this.convertRateToPeriodicRate(rate, ratePeriod, repaymentCycle);
        
        // Calculate installment using PMT formula
        if (periodicRate === 0) {
            // If no interest, just divide principal by installments
            const installmentAmount = principal / installments;
            return {
                total_interest: 0,
                total_amount: principal,
                installment_amount: Math.round(installmentAmount * 100) / 100,
                periodic_rate: 0,
                effective_annual_rate: 0
            };
        }

        const installmentAmount = principal * (periodicRate * Math.pow(1 + periodicRate, installments)) / 
                                 (Math.pow(1 + periodicRate, installments) - 1);
        
        const totalAmount = installmentAmount * installments;
        const totalInterest = totalAmount - principal;

        return {
            total_interest: Math.round(totalInterest * 100) / 100,
            total_amount: Math.round(totalAmount * 100) / 100,
            installment_amount: Math.round(installmentAmount * 100) / 100,
            periodic_rate: periodicRate,
            effective_annual_rate: this.calculateEffectiveAnnualRateFromPeriodic(periodicRate, repaymentCycle)
        };
    }

    // Simple interest calculation
    static calculateSimple(principal, rate, duration, installments, ratePeriod) {
        const annualRate = this.convertRateToAnnual(rate, ratePeriod);
        const durationInYears = this.convertDurationToYears(duration, 'months');
        
        const totalInterest = principal * annualRate * durationInYears;
        const totalAmount = principal + totalInterest;
        const installmentAmount = totalAmount / installments;

        return {
            total_interest: Math.round(totalInterest * 100) / 100,
            total_amount: Math.round(totalAmount * 100) / 100,
            installment_amount: Math.round(installmentAmount * 100) / 100,
            annual_rate: annualRate,
            effective_annual_rate: annualRate
        };
    }

    // Compound interest calculation
    static calculateCompound(principal, rate, duration, installments, ratePeriod) {
        const annualRate = this.convertRateToAnnual(rate, ratePeriod);
        const durationInYears = this.convertDurationToYears(duration, 'months');
        
        // Compound annually for simplicity
        const totalAmount = principal * Math.pow(1 + annualRate, durationInYears);
        const totalInterest = totalAmount - principal;
        const installmentAmount = totalAmount / installments;

        return {
            total_interest: Math.round(totalInterest * 100) / 100,
            total_amount: Math.round(totalAmount * 100) / 100,
            installment_amount: Math.round(installmentAmount * 100) / 100,
            compound_annual_rate: annualRate,
            effective_annual_rate: annualRate
        };
    }

    // Helper methods
    static convertRateToPeriodicRate(rate, ratePeriod, repaymentCycle) {
        // First convert to annual rate
        const annualRate = this.convertRateToAnnual(rate, ratePeriod);
        
        // Then convert to periodic rate based on repayment cycle
        switch (repaymentCycle) {
            case 'daily': return annualRate / 365;
            case 'weekly': return annualRate / 52;
            case 'bi_weekly': return annualRate / 26;
            case 'monthly': return annualRate / 12;
            case 'quarterly': return annualRate / 4;
            case 'semi_annually': return annualRate / 2;
            case 'annually': return annualRate;
            case 'bullet': return annualRate; // For bullet payments, use annual rate
            default: return annualRate / 12;
        }
    }

    static convertRateToAnnual(rate, period) {
        switch (period) {
            case 'daily': return rate * 365;
            case 'weekly': return rate * 52;
            case 'monthly': return rate * 12;
            case 'yearly': return rate;
            case 'per_loan': return rate; // This needs context of loan duration
            default: return rate;
        }
    }

    static convertDurationToYears(duration, unit) {
        switch (unit) {
            case 'days': return duration / 365;
            case 'weeks': return duration / 52;
            case 'months': return duration / 12;
            case 'years': return duration;
            default: return duration;
        }
    }

    static convertDurationToDays(duration, unit) {
        switch (unit) {
            case 'days': return duration;
            case 'weeks': return duration * 7;
            case 'months': return duration * 30; // Approximate
            case 'years': return duration * 365;
            default: return duration;
        }
    }

    static calculateEffectiveAnnualRate(totalRate, duration, durationUnit) {
        const durationInYears = this.convertDurationToYears(duration, durationUnit);
        if (durationInYears === 0) return 0;
        return totalRate / durationInYears;
    }

    static calculateEffectiveAnnualRateFromPeriodic(periodicRate, cycle) {
        switch (cycle) {
            case 'daily': return Math.pow(1 + periodicRate, 365) - 1;
            case 'weekly': return Math.pow(1 + periodicRate, 52) - 1;
            case 'bi_weekly': return Math.pow(1 + periodicRate, 26) - 1;
            case 'monthly': return Math.pow(1 + periodicRate, 12) - 1;
            case 'quarterly': return Math.pow(1 + periodicRate, 4) - 1;
            case 'semi_annually': return Math.pow(1 + periodicRate, 2) - 1;
            case 'annually': return periodicRate;
            default: return Math.pow(1 + periodicRate, 12) - 1;
        }
    }

    static calculateFirstPaymentDate(releaseDate, cycle) {
        const firstPayment = new Date(releaseDate);
        
        switch (cycle) {
            case 'daily':
                firstPayment.setDate(firstPayment.getDate() + 1);
                break;
            case 'weekly':
                firstPayment.setDate(firstPayment.getDate() + 7);
                break;
            case 'bi_weekly':
                firstPayment.setDate(firstPayment.getDate() + 14);
                break;
            case 'monthly':
                firstPayment.setMonth(firstPayment.getMonth() + 1);
                break;
            case 'quarterly':
                firstPayment.setMonth(firstPayment.getMonth() + 3);
                break;
            case 'semi_annually':
                firstPayment.setMonth(firstPayment.getMonth() + 6);
                break;
            case 'annually':
                firstPayment.setFullYear(firstPayment.getFullYear() + 1);
                break;
            case 'bullet':
                // For bullet payment, first (and only) payment is at maturity
                firstPayment.setMonth(firstPayment.getMonth() + 1); // Default to 1 month
                break;
        }
        
        return firstPayment.toISOString().split('T')[0];
    }

    static calculateMaturityDate(firstPaymentDate, cycle, installments) {
        if (cycle === 'bullet') {
            return firstPaymentDate; // For bullet, first payment is maturity
        }

        const maturity = new Date(firstPaymentDate);
        
        for (let i = 1; i < installments; i++) {
            this.addPeriodToDate(maturity, cycle);
        }
        
        return maturity.toISOString().split('T')[0];
    }

    static addPeriodToDate(date, cycle) {
        switch (cycle) {
            case 'daily':
                date.setDate(date.getDate() + 1);
                break;
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'bi_weekly':
                date.setDate(date.getDate() + 14);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'quarterly':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'semi_annually':
                date.setMonth(date.getMonth() + 6);
                break;
            case 'annually':
                date.setFullYear(date.getFullYear() + 1);
                break;
        }
    }

    static generatePaymentSchedule(params) {
        const {
            principal_amount,
            installment_amount,
            total_interest,
            number_of_repayments,
            first_payment_date,
            repayment_cycle,
            interest_method,
            principal_per_installment,
            interest_per_installment,
            periodic_rate
        } = params;

        const schedule = [];
        let remainingBalance = principal_amount;
        let currentDate = new Date(first_payment_date);
        let totalPrincipalPaid = 0;
        let totalInterestPaid = 0;

        for (let i = 1; i <= number_of_repayments; i++) {
            let principalPayment, interestPayment, currentInstallment;

            if (interest_method === 'flat') {
                principalPayment = principal_per_installment;
                interestPayment = interest_per_installment;
                currentInstallment = installment_amount;
            } else if (interest_method === 'reducing_balance') {
                interestPayment = remainingBalance * (periodic_rate || 0);
                principalPayment = installment_amount - interestPayment;
                currentInstallment = installment_amount;
                
                // Adjust last payment to clear remaining balance
                if (i === number_of_repayments) {
                    principalPayment = remainingBalance;
                    currentInstallment = principalPayment + interestPayment;
                }
            } else if (repayment_cycle === 'bullet' && i === number_of_repayments) {
                // Bullet payment - pay all principal at end
                principalPayment = principal_amount;
                interestPayment = total_interest;
                currentInstallment = principal_amount + total_interest;
            } else {
                // For simple and compound, distribute evenly
                principalPayment = principal_amount / number_of_repayments;
                interestPayment = total_interest / number_of_repayments;
                currentInstallment = installment_amount;
            }

            remainingBalance = Math.max(0, remainingBalance - principalPayment);
            totalPrincipalPaid += principalPayment;
            totalInterestPaid += interestPayment;

            schedule.push({
                installment_number: i,
                due_date: currentDate.toISOString().split('T')[0],
                installment_amount: Math.round(currentInstallment * 100) / 100,
                principal_amount: Math.round(principalPayment * 100) / 100,
                interest_amount: Math.round(interestPayment * 100) / 100,
                remaining_balance: Math.round(remainingBalance * 100) / 100,
                cumulative_principal: Math.round(totalPrincipalPaid * 100) / 100,
                cumulative_interest: Math.round(totalInterestPaid * 100) / 100
            });

            // Move to next payment date (except for last iteration)
            if (i < number_of_repayments) {
                this.addPeriodToDate(currentDate, repayment_cycle);
            }
        }

        return schedule;
    }

    static generateLoanSummary(results) {
        const {
            principal_amount,
            total_interest,
            total_amount,
            installment_amount,
            number_of_repayments,
            first_payment_date,
            maturity_date,
            effective_annual_rate,
            interest_method,
            input_parameters
        } = results;

        // Calculate loan duration in days
        const startDate = new Date(input_parameters.loan_release_date);
        const endDate = new Date(maturity_date);
        const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        return {
            loan_overview: {
                principal_amount: principal_amount,
                total_interest: total_interest,
                total_amount: total_amount,
                total_cost_percentage: Math.round((total_interest / principal_amount) * 10000) / 100, // Percentage with 2 decimals
                savings_vs_principal: Math.round(((total_amount - principal_amount) / principal_amount) * 10000) / 100
            },
            payment_details: {
                installment_amount: installment_amount,
                number_of_payments: number_of_repayments,
                payment_frequency: input_parameters.repayment_cycle,
                first_payment_date: first_payment_date,
                final_payment_date: maturity_date
            },
            duration_analysis: {
                total_days: durationDays,
                total_weeks: Math.ceil(durationDays / 7),
                total_months: Math.ceil(durationDays / 30),
                total_years: Math.round((durationDays / 365) * 100) / 100
            },
            interest_analysis: {
                effective_annual_rate: Math.round((effective_annual_rate || 0) * 10000) / 100, // Convert to percentage
                interest_method: interest_method,
                primary_rate: input_parameters.primary_interest_rate,
                rate_period: input_parameters.primary_rate_period
            },
            comparison_metrics: {
                cost_per_day: Math.round((total_interest / durationDays) * 100) / 100,
                cost_per_month: Math.round((total_interest / (durationDays / 30)) * 100) / 100,
                daily_payment_equivalent: Math.round((installment_amount / this.getPaymentFrequencyDays(input_parameters.repayment_cycle)) * 100) / 100
            }
        };
    }

    static getPaymentFrequencyDays(cycle) {
        switch (cycle) {
            case 'daily': return 1;
            case 'weekly': return 7;
            case 'bi_weekly': return 14;
            case 'monthly': return 30;
            case 'quarterly': return 90;
            case 'semi_annually': return 180;
            case 'annually': return 365;
            case 'bullet': return 365; // Default for bullet
            default: return 30;
        }
    }

    // Quick calculation presets
    static getCalculationPresets() {
        return [
            {
                name: 'Personal Loan - 6 Months (Monthly)',
                description: 'Standard personal loan with monthly payments',
                interest_method: 'reducing_balance',
                primary_rate_period: 'monthly',
                primary_duration_unit: 'months',
                loan_duration_months: 6,
                repayment_cycle: 'monthly',
                number_of_repayments: 6,
                interest_rate_per_month: 0.03,
                suggested_amounts: [50000, 100000, 200000, 500000]
            },
            {
                name: 'Business Loan - 12 Months (Monthly)',
                description: 'Business loan with reducing balance',
                interest_method: 'reducing_balance',
                primary_rate_period: 'monthly',
                primary_duration_unit: 'months',
                loan_duration_months: 12,
                repayment_cycle: 'monthly',
                number_of_repayments: 12,
                interest_rate_per_month: 0.025,
                suggested_amounts: [100000, 500000, 1000000, 2000000]
            },
            {
                name: 'Emergency Loan - 30 Days (Bullet)',
                description: 'Short-term emergency loan with single payment',
                interest_method: 'simple',
                primary_rate_period: 'per_loan',
                primary_duration_unit: 'days',
                loan_duration_days: 30,
                repayment_cycle: 'bullet',
                number_of_repayments: 1,
                effective_rate_per_loan: 0.05,
                suggested_amounts: [25000, 50000, 100000, 200000]
            },
            {
                name: 'Weekly Microfinance',
                description: 'Microfinance loan with weekly payments',
                interest_method: 'flat',
                primary_rate_period: 'weekly',
                primary_duration_unit: 'weeks',
                loan_duration_weeks: 12,
                repayment_cycle: 'weekly',
                number_of_repayments: 12,
                interest_rate_per_week: 0.02,
                suggested_amounts: [10000, 25000, 50000, 100000]
            },
            {
                name: 'Asset Finance - 24 Months',
                description: 'Asset financing with bi-weekly payments',
                interest_method: 'reducing_balance',
                primary_rate_period: 'monthly',
                primary_duration_unit: 'months',
                loan_duration_months: 24,
                repayment_cycle: 'bi_weekly',
                number_of_repayments: 52,
                interest_rate_per_month: 0.02,
                suggested_amounts: [500000, 1000000, 2000000, 5000000]
            }
        ];
    }
}

module.exports = LoanCalculator;
