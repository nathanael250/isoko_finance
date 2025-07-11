import React, { useState, useEffect } from 'react';
import { Banknote, Calendar, Percent, Clock, CalendarDays, Calculator, Briefcase, GraduationCap } from 'lucide-react';
import { loanTypeService } from '../../services/loanTypeService';

const LoanCalculator = () => {
  const [loanTypes, setLoanTypes] = useState([]);
  const [formData, setFormData] = useState({
    principalOutstanding: '',
    loanReleaseDate: '',
    interestRate: '',
    interestMethod: 'reducing_balance_equal_installments',
    interestType: 'percentage',
    interestPeriod: 'year',
    loanDuration: '',
    durationUnit: 'months',
    repaymentCycle: 'monthly',
    numberOfRepayments: '',
    loanTypeId: ''
  });

  const [results, setResults] = useState(null);
  const [editableAmortizationSchedule, setEditableAmortizationSchedule] = useState([]);
  const [userEditedRepayments, setUserEditedRepayments] = useState(false);

  useEffect(() => {
    const fetchLoanTypes = async () => {
      try {
        const response = await loanTypeService.getActiveLoanTypes();
        if (response.success) {
          setLoanTypes(response.data.loan_types);
        }
      } catch (error) {
        console.error('Error fetching loan types:', error);
      }
    };

    fetchLoanTypes();
  }, []);

  useEffect(() => {
    if (results && results.amortizationSchedule) {
      setEditableAmortizationSchedule(results.amortizationSchedule);
    }
  }, [results]);

  useEffect(() => {
    if (!userEditedRepayments) {
      // Only auto-calculate if the user hasn't manually changed it
      const duration = parseInt(formData.loanDuration);
      if (!isNaN(duration) && duration > 0) {
        let repayments = duration;
        // Adjust based on units and cycle
        if (formData.durationUnit === 'months') {
          if (formData.repaymentCycle === 'monthly') repayments = duration;
          if (formData.repaymentCycle === 'weekly') repayments = duration * 4;
          if (formData.repaymentCycle === 'daily') repayments = duration * 30;
          if (formData.repaymentCycle === 'quarterly') repayments = Math.ceil(duration / 3);
        }
        if (formData.durationUnit === 'years') {
          if (formData.repaymentCycle === 'monthly') repayments = duration * 12;
          if (formData.repaymentCycle === 'weekly') repayments = duration * 52;
          if (formData.repaymentCycle === 'daily') repayments = duration * 365;
          if (formData.repaymentCycle === 'quarterly') repayments = duration * 4;
        }
        if (formData.durationUnit === 'weeks') {
          if (formData.repaymentCycle === 'weekly') repayments = duration;
          if (formData.repaymentCycle === 'monthly') repayments = Math.ceil(duration / 4);
          if (formData.repaymentCycle === 'daily') repayments = duration * 7;
          if (formData.repaymentCycle === 'quarterly') repayments = Math.ceil(duration / 13);
        }
        if (formData.durationUnit === 'days') {
          if (formData.repaymentCycle === 'daily') repayments = duration;
          if (formData.repaymentCycle === 'weekly') repayments = Math.ceil(duration / 7);
          if (formData.repaymentCycle === 'monthly') repayments = Math.ceil(duration / 30);
          if (formData.repaymentCycle === 'quarterly') repayments = Math.ceil(duration / 90);
        }
        setFormData(prev => ({
          ...prev,
          numberOfRepayments: repayments.toString()
        }));
      }
    }
  }, [formData.loanDuration, formData.durationUnit, formData.repaymentCycle, userEditedRepayments]);

  const handleLoanTypeChange = (e) => {
    const loanTypeId = e.target.value;
    const selectedLoanType = loanTypes.find(type => type.id === parseInt(loanTypeId));

    if (selectedLoanType) {
      setFormData(prev => ({
        ...prev,
        loanTypeId: loanTypeId,
        interestRate: selectedLoanType.nominal_interest_rate ? selectedLoanType.nominal_interest_rate.toString() : '',
        interestMethod: selectedLoanType.interest_calculation_method || 'reducing_balance_equal_installments',
        repaymentCycle: selectedLoanType.default_frequency || 'monthly'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        loanTypeId: loanTypeId,
        interestRate: '',
        interestMethod: 'reducing_balance_equal_installments',
        repaymentCycle: 'monthly'
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'numberOfRepayments') {
      setUserEditedRepayments(true);
    }
    if (['loanDuration', 'durationUnit', 'repaymentCycle'].includes(name)) {
      setUserEditedRepayments(false);
    }
  };

  const handleAmortizationEdit = (id, field, value) => {
    setEditableAmortizationSchedule(prevSchedule => {
      const newSchedule = prevSchedule.map(row => ({
        ...row
      })); // Deep copy to ensure immutability

      const editedRowIndex = newSchedule.findIndex(row => row.id === id);
      if (editedRowIndex === -1) return prevSchedule; // Should not happen

      const editedRow = newSchedule[editedRowIndex];
      editedRow[field] = value;

      // Recalculate dueAmount for the current edited row
      const currentPrincipal = parseFloat(editedRow.principalAmount || 0);
      const currentInterest = parseFloat(editedRow.interestAmount || 0);
      const currentFee = parseFloat(editedRow.feeAmount || 0);
      const currentPenalty = parseFloat(editedRow.penaltyAmount || 0);
      editedRow.dueAmount = (currentPrincipal + currentInterest + currentFee + currentPenalty).toFixed(2);

      // Re-calculate principal balance for the edited row and all subsequent rows
      let runningPrincipalBalance = parseFloat(formData.principalOutstanding);
      for (let i = 0; i < newSchedule.length; i++) {
        const row = newSchedule[i];
        if (i < editedRowIndex) {
          // For rows before the edited one, use their calculated principal balance
          runningPrincipalBalance = parseFloat(row.principalBalance);
        } else {
          // For the edited row and subsequent rows, recalculate principal balance
          const principalPaidThisPeriod = parseFloat(row.principalAmount || 0);
          runningPrincipalBalance = Math.max(0, runningPrincipalBalance - principalPaidThisPeriod);
          row.principalBalance = runningPrincipalBalance.toFixed(2);
          // Note: Interest is NOT re-calculated based on new principal balance here.
          // A full re-amortization would be more complex and require re-running the loan logic.
        }
      }

      return newSchedule;
    });
  };

  const calculateLoan = (e) => {
    e.preventDefault();

    const principal = parseFloat(formData.principalOutstanding);
    const inputInterestRate = parseFloat(formData.interestRate);
    const numberOfRepayments = parseInt(formData.numberOfRepayments);
    const interestMethod = formData.interestMethod;
    const interestType = formData.interestType;
    const interestPeriod = formData.interestPeriod;
    const loanDurationVal = parseInt(formData.loanDuration);
    const durationUnit = formData.durationUnit;
    const repaymentCycle = formData.repaymentCycle;

    if (isNaN(principal) || principal <= 0) {
      alert('Please enter a valid Principal Outstanding amount.');
      setResults(null);
      return;
    }
    if (isNaN(inputInterestRate)) {
      alert('Please enter a valid Interest Rate.');
      setResults(null);
      return;
    }
    if (isNaN(numberOfRepayments) || numberOfRepayments <= 0) {
      alert('Please enter a valid Number of Repayments.');
      setResults(null);
      return;
    }
    if (!formData.loanReleaseDate) {
      alert('Please select a Loan Release Date.');
      setResults(null);
      return;
    }

    let periodicRate = 0; // for percentage calculations
    let periodicFixedAmount = 0; // for fixed amount calculations
    let totalInterestOverall = 0;
    let totalDueOverall = 0;
    let amortizationSchedule = [];

    const loanStartDate = new Date(formData.loanReleaseDate);

    // Calculate Maturity Date
    let maturityDate = new Date(loanStartDate);
    switch (durationUnit) {
      case 'days': maturityDate.setDate(loanStartDate.getDate() + loanDurationVal); break;
      case 'weeks': maturityDate.setDate(loanStartDate.getDate() + (loanDurationVal * 7)); break;
      case 'months': maturityDate.setMonth(loanStartDate.getMonth() + loanDurationVal); break;
      case 'years': maturityDate.setFullYear(loanStartDate.getFullYear() + loanDurationVal); break;
    }

    // Determine periodic rate/amount based on interest type and period
    if (interestType === 'percentage') {
      // Convert the input rate to a rate per repayment cycle
      let ratePerPeriod;
      const inputRateDecimal = inputInterestRate / 100;

      if (interestPeriod === 'loan') {
        // If interest is per loan, distribute it evenly across repayments
        ratePerPeriod = inputRateDecimal / numberOfRepayments;
      } else {
        // Convert input rate to annual equivalent based on its period
        let annualRate;
        switch (interestPeriod) {
          case 'day': annualRate = inputRateDecimal * 365; break;
          case 'week': annualRate = inputRateDecimal * 52; break;
          case 'month': annualRate = inputRateDecimal * 12; break;
          case 'year': annualRate = inputRateDecimal; break;
          default: annualRate = inputRateDecimal; // Default to annual if not specified
        }

        // Convert annual rate to rate per repayment cycle
        let paymentsPerYear;
        switch (repaymentCycle) {
          case 'daily': paymentsPerYear = 365; break;
          case 'weekly': paymentsPerYear = 52; break;
          case 'monthly': paymentsPerYear = 12; break;
          case 'quarterly': paymentsPerYear = 4; break;
          default: paymentsPerYear = 12;
        }
        ratePerPeriod = annualRate / paymentsPerYear;
      }
      periodicRate = ratePerPeriod;
    } else { // interestType === 'fixed'
      // If fixed amount, the inputInterestRate is the amount itself
      if (interestPeriod === 'loan') {
        periodicFixedAmount = inputInterestRate / numberOfRepayments; // Total fixed amount / number of repayments
      } else {
        let annualFixedAmount;
        switch (interestPeriod) {
          case 'day': annualFixedAmount = inputInterestRate * 365; break;
          case 'week': annualFixedAmount = inputInterestRate * 52; break;
          case 'month': annualFixedAmount = inputInterestRate * 12; break;
          case 'year': annualFixedAmount = inputInterestRate; break;
          default: annualFixedAmount = inputInterestRate; // Default to annual
        }

        let paymentsPerYear;
        switch (repaymentCycle) {
          case 'daily': paymentsPerYear = 365; break;
          case 'weekly': paymentsPerYear = 52; break;
          case 'monthly': paymentsPerYear = 12; break;
          case 'quarterly': paymentsPerYear = 4; break;
          default: paymentsPerYear = 12;
        }
        periodicFixedAmount = annualFixedAmount / paymentsPerYear;
      }
    }

    let currentPrincipalBalance = principal;
    let calculatedPeriodicPayment = 0; // For equal installment methods
    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;
    let totalFees = 0;
    let totalPenalties = 0;

    // Calculate the fixed periodic payment for Equal Installments methods first
    if (interestMethod === 'reducing_balance_equal_installments' || interestMethod === 'compound_interest_equal_installments') {
      if (periodicRate === 0) {
        calculatedPeriodicPayment = principal / numberOfRepayments;
      } else {
        calculatedPeriodicPayment = (principal * periodicRate) / (1 - Math.pow(1 + periodicRate, -numberOfRepayments));
      }
    }

    for (let i = 1; i <= numberOfRepayments; i++) {
      let principalComponent = 0;
      let interestComponent = 0;
      let dueAmount = 0;

      let currentPaymentDueDate = new Date(loanStartDate);
      switch (repaymentCycle) {
        case 'daily': currentPaymentDueDate.setDate(loanStartDate.getDate() + i); break;
        case 'weekly': currentPaymentDueDate.setDate(loanStartDate.getDate() + (i * 7)); break;
        case 'monthly': currentPaymentDueDate.setMonth(loanStartDate.getMonth() + i); break;
        case 'quarterly': currentPaymentDueDate.setMonth(loanStartDate.getMonth() + (i * 3)); break;
      }

      // Calculate interest component for the current period
      if (interestType === 'percentage') {
        interestComponent = currentPrincipalBalance * periodicRate; // Based on remaining balance for most methods
      } else { // fixed amount
        interestComponent = periodicFixedAmount;
      }

      switch (interestMethod) {
        case 'reducing_balance_equal_installments':
        case 'compound_interest_equal_installments': // Treat similarly for calculation based on periodicRate
          principalComponent = calculatedPeriodicPayment - interestComponent;
          dueAmount = calculatedPeriodicPayment;
          break;

        case 'reducing_balance_equal_principal':
          principalComponent = principal / numberOfRepayments;
          dueAmount = principalComponent + interestComponent;
          break;

        case 'flat_rate':
          principalComponent = principal / numberOfRepayments;
          // For flat rate, total interest is simple interest on original principal for the full duration
          let totalFlatRateInterest;
          if (interestType === 'percentage') {
            // If interest is percentage based on the whole loan, calculate total interest first
            // For flat rate, we usually assume the interest rate is annual and applied on initial principal
            totalFlatRateInterest = principal * (inputInterestRate / 100) * (loanDurationVal / (durationUnit === 'years' ? 1 : (durationUnit === 'months' ? 12 : (durationUnit === 'weeks' ? 52 : 365))));
          } else { // fixed amount
            totalFlatRateInterest = inputInterestRate; // This fixed amount is for the whole loan
          }
          interestComponent = totalFlatRateInterest / numberOfRepayments;
          dueAmount = principalComponent + interestComponent;
          break;

        case 'interest_only':
          principalComponent = (i === numberOfRepayments) ? currentPrincipalBalance : 0; // Principal paid at the very last installment
          dueAmount = interestComponent + principalComponent;
          break;

        case 'compound_interest_accrued':
          principalComponent = (i === numberOfRepayments) ? principal : 0; // Principal paid at the end
          // Interest accrues, all paid at the end. For intermediate payments, interestComponent is 0.
          if (i === numberOfRepayments) {
            // Recalculate total accrued interest at the end based on initial principal and compounded rate
            if (interestType === 'percentage') {
              interestComponent = principal * (Math.pow(1 + periodicRate, numberOfRepayments) - 1); // Total accrued interest
            } else { // fixed amount
              interestComponent = inputInterestRate; // Assuming input is total fixed for loan
            }
          } else {
            interestComponent = 0; // No interest payment until the end for accrued
          }
          dueAmount = principalComponent + interestComponent;
          break;

        default: // Should not happen with exhaustive case statements
          principalComponent = 0;
          interestComponent = 0;
          dueAmount = 0;
          break;
      }

      // Update current principal balance for the next iteration (only for principal-reducing methods)
      if (interestMethod !== 'interest_only' && interestMethod !== 'compound_interest_accrued' || i === numberOfRepayments) {
        currentPrincipalBalance = Math.max(0, currentPrincipalBalance - principalComponent);
      }

      totalPrincipalPaid += principalComponent;
      totalInterestPaid += interestComponent;
      totalDueOverall += dueAmount;

      amortizationSchedule.push({
        id: i,
        dueDate: currentPaymentDueDate.toISOString().split('T')[0],
        principalAmount: principalComponent.toFixed(2),
        interestAmount: interestComponent.toFixed(2),
        feeAmount: '0.00', // Default fees for now
        penaltyAmount: '0.00', // Default penalties for now
        dueAmount: dueAmount.toFixed(2),
        principalBalance: currentPrincipalBalance.toFixed(2),
        description: 'Repayment'
      });
    }

    setResults({
      releasedDate: loanStartDate.toLocaleDateString('en-GB'), // DD/MM/YYYY
      maturityDate: maturityDate.toLocaleDateString('en-GB'), // DD/MM/YYYY
      repaymentCycleDisplay: repaymentCycle,
      totalPrincipalOverall: principal.toFixed(2),
      totalInterestOverall: totalInterestPaid.toFixed(2),
      totalFeesOverall: totalFees.toFixed(2),
      totalDueOverall: totalDueOverall.toFixed(2),
      amortizationSchedule: amortizationSchedule
    });
  };

  return (
    <div className="container mx-auto bg-slate-200 px-4 py-8">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-600">Loan Calculator</h1>
        </div>

        <form onSubmit={calculateLoan} className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Loan Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">
                Loan Type *
              </label>
              <select
                name="loanTypeId"
                value={formData.loanTypeId}
                onChange={handleLoanTypeChange}
                className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select a loan type</option>
                {loanTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Principal Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">
                Principal Outstanding *
              </label>
              <input
                type="number"
                name="principalOutstanding"
                value={formData.principalOutstanding}
                onChange={handleInputChange}
                placeholder="Enter principal amount"
                className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">
                Loan Release Date *
              </label>
              <input
                type="date"
                name="loanReleaseDate"
                value={formData.loanReleaseDate}
                onChange={handleInputChange}
                className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Interest Details */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 mt-3 flex items-center">
                <Percent className="h-5 w-5 mr-2 text-primary" />
                Interest Details
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">
                Interest Rate *
              </label>
              <input
                type="number"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleInputChange}
                placeholder="Enter interest rate"
                className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">
                Interest Period *
              </label>
              <select
                name="interestPeriod"
                value={formData.interestPeriod}
                onChange={handleInputChange}
                className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="day">Per Day</option>
                <option value="week">Per Week</option>
                <option value="month">Per Month</option>
                <option value="year">Per Year</option>
                <option value="loan">Per Loan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">
                Interest Method *
              </label>
              <select
                name="interestMethod"
                value={formData.interestMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="reducing_balance_equal_installments">Reducing Balance - Equal Installments</option>
                <option value="reducing_balance_equal_principal">Reducing Balance - Equal Principal</option>
                <option value="interest_only">Interest-Only</option>
                <option value="compound_interest_accrued">Compound Interest - Accrued</option>
                <option value="compound_interest_equal_installments">Compound Interest - Equal Installments</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">
                Interest Type *
              </label>
              <div className="space-y-1">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="percentage"
                    name="interestType"
                    value="percentage"
                    checked={formData.interestType === 'percentage'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="percentage" className="ml-2 block text-sm text-gray-700">
                    I want Interest to be percentage % based
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="fixed"
                    name="interestType"
                    value="fixed"
                    checked={formData.interestType === 'fixed'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="fixed" className="ml-2 block text-sm text-gray-700">
                    I want Interest to be a fixed amount Per Cycle
                  </label>
                </div>
              </div>
            </div>

            {/* Loan Terms */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 mt-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Loan Terms
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">
                Loan Duration *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="loanDuration"
                  value={formData.loanDuration}
                  onChange={handleInputChange}
                  placeholder="Enter duration"
                  className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                <select
                  name="durationUnit"
                  value={formData.durationUnit}
                  onChange={handleInputChange}
                  className="w-32 px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">
                Repayment Cycle *
              </label>
              <select
                name="repaymentCycle"
                value={formData.repaymentCycle}
                onChange={handleInputChange}
                className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">
                Number of Repayments *
              </label>
              <input
                type="number"
                name="numberOfRepayments"
                value={formData.numberOfRepayments}
                onChange={handleInputChange}
                placeholder="Enter number of repayments"
                className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Calculate Loan
            </button>
          </div>
        </form>


        {/* Results Section */}
        {results && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            {/* Top Summary Table */}
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
                <thead className="bg-blue-600">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white border-r border-blue-500">Released</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white border-r border-blue-500">Maturity</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white border-r border-blue-500">Repayment</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white border-r border-blue-500">Principal</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white border-r border-blue-500">Interest</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white border-r border-blue-500">Fees (Non Deduct)</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white">Due</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm">{results.releasedDate}</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm">{results.maturityDate}</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm capitalize">{results.repaymentCycleDisplay}</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm font-semibold">${results.totalPrincipalOverall}</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm font-semibold">${results.totalInterestOverall}</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm font-semibold">${results.totalFeesOverall}</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm font-semibold">${results.totalDueOverall}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              You can edit the below fields. The amounts will automatically update below.
            </p>

            {/* Amortization Schedule Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
                <thead className="bg-blue-600">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white border-r border-blue-500">#</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white border-r border-blue-500">Due Date</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white border-r border-blue-500">Principal Amount</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white border-r border-blue-500">Interest Amount</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white border-r border-blue-500">Fee Amount</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white border-r border-blue-500">Penalty Amount</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white border-r border-blue-500">Due Amount</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white border-r border-blue-500">Principal Balance</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-white">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {editableAmortizationSchedule.map((row, index) => (
                    <tr key={row.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm">{row.id}</td>
                      <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm">
                        <input
                          type="date"
                          value={row.dueDate}
                          onChange={(e) => handleAmortizationEdit(row.id, 'dueDate', e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center w-full">
                            <input
                              type="number"
                              value={row.principalAmount}
                              onChange={(e) => handleAmortizationEdit(row.id, 'principalAmount', e.target.value)}
                              className="w-full bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="ml-1 text-gray-500 text-sm">+</span>
                          </div>
                          <span className="text-blue-500 text-xs mt-1 cursor-pointer hover:text-blue-700">Set Default</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm">
                        <input
                          type="number"
                          value={row.interestAmount}
                          onChange={(e) => handleAmortizationEdit(row.id, 'interestAmount', e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm">
                        <div className="flex flex-col items-end">
                          <input
                            type="number"
                            value={row.feeAmount}
                            onChange={(e) => handleAmortizationEdit(row.id, 'feeAmount', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-blue-500 text-xs mt-1 cursor-pointer hover:text-blue-700">Set Default</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm">
                        <div className="flex flex-col items-end">
                          <input
                            type="number"
                            value={row.penaltyAmount}
                            onChange={(e) => handleAmortizationEdit(row.id, 'penaltyAmount', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-blue-500 text-xs mt-1 cursor-pointer hover:text-blue-700">Set Default</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm">
                        <div className="flex items-center justify-end">
                          <span className="mr-1 text-gray-500 text-sm">=</span>
                          <span className="font-semibold">{row.dueAmount}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm font-medium">{row.principalBalance}</td>
                      <td className="py-3 px-4 border-b border-gray-200 text-gray-800 text-sm">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCalculator;
