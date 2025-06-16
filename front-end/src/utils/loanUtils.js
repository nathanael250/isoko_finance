// Utility functions for loan calculations and management

/**
 * Calculate the total amount due for a loan
 * @param {number} principal - The principal amount
 * @param {number} interestRate - The interest rate (as a decimal)
 * @param {number} term - The loan term in months
 * @returns {number} The total amount due
 */
export const calculateTotalDue = (principal, interestRate, term) => {
  const interest = principal * interestRate * term;
  return principal + interest;
};

/**
 * Calculate the monthly payment for a loan
 * @param {number} principal - The principal amount
 * @param {number} interestRate - The interest rate (as a decimal)
 * @param {number} term - The loan term in months
 * @returns {number} The monthly payment amount
 */
export const calculateMonthlyPayment = (principal, interestRate, term) => {
  const monthlyRate = interestRate / 12;
  const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) /
                 (Math.pow(1 + monthlyRate, term) - 1);
  return payment;
};

/**
 * Calculate the number of days a loan is overdue
 * @param {string} dueDate - The due date of the loan
 * @returns {number} The number of days overdue
 */
export const calculateDaysOverdue = (dueDate) => {
  if (!dueDate) return 0;
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: RWF)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'RWF') => {
  if (!amount || isNaN(amount)) return `${currency} 0.00`;
  return `${currency} ${parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format date string
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Calculate late payment fee
 * @param {number} amount - The overdue amount
 * @param {number} daysOverdue - Number of days the payment is overdue
 * @param {number} feeRate - The late fee rate (as a decimal)
 * @returns {number} The late fee amount
 */
export const calculateLateFee = (amount, daysOverdue, feeRate) => {
  return amount * feeRate * Math.ceil(daysOverdue / 30);
};

/**
 * Check if a loan is in default
 * @param {number} daysOverdue - Number of days the payment is overdue
 * @param {number} defaultThreshold - Number of days after which a loan is considered in default
 * @returns {boolean} Whether the loan is in default
 */
export const isLoanInDefault = (daysOverdue, defaultThreshold = 90) => {
  return daysOverdue >= defaultThreshold;
};

/**
 * Calculate the remaining balance on a loan
 * @param {number} principal - The original principal amount
 * @param {number} paymentsMade - Number of payments made
 * @param {number} monthlyPayment - The monthly payment amount
 * @returns {number} The remaining balance
 */
export const calculateRemainingBalance = (principal, paymentsMade, monthlyPayment) => {
  const totalPaid = paymentsMade * monthlyPayment;
  return Math.max(0, principal - totalPaid);
};

/**
 * Get loan status based on payment history
 * @param {Object} loan - The loan object
 * @returns {string} The loan status
 */
export const getLoanStatus = (loan) => {
  const daysOverdue = calculateDaysOverdue(loan.dueDate);
  
  if (daysOverdue <= 0) return 'Current';
  if (daysOverdue <= 30) return 'Overdue';
  if (daysOverdue <= 60) return 'Late';
  if (daysOverdue <= 90) return 'Serious';
  return 'Default';
};

/**
 * Get color class based on loan schedule/repayment status
 * @param {string} status - The status
 * @returns {string} Tailwind CSS color class
 */
export const getStatusColor = (status) => {
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'partial': 'bg-orange-100 text-orange-800',
    'overdue': 'bg-red-100 text-red-800',
    'paid': 'bg-green-100 text-green-800',
    'completed': 'bg-green-100 text-green-800',
    'active': 'bg-blue-100 text-blue-800',
    'defaulted': 'bg-red-200 text-red-900',
    'written_off': 'bg-gray-100 text-gray-800',
    // Legacy status mappings
    'current': 'bg-green-100 text-green-600',
    'late': 'bg-orange-100 text-orange-600',
    'serious': 'bg-red-100 text-red-600',
    'default': 'bg-red-200 text-red-800'
  };
  
  return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Get color class based on loan status (different from schedule status)
 * @param {string} status - The loan status
 * @returns {string} Tailwind CSS color class with borders
 */
export const getLoanStatusColor = (status) => {
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'under_review': 'bg-blue-100 text-blue-800 border-blue-200',
    'approved': 'bg-green-100 text-green-800 border-green-200',
    'disbursed': 'bg-purple-100 text-purple-800 border-purple-200',
    'active': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'completed': 'bg-gray-100 text-gray-800 border-gray-200',
    'defaulted': 'bg-red-100 text-red-800 border-red-200',
    'rejected': 'bg-red-100 text-red-800 border-red-200',
    'written_off': 'bg-gray-200 text-gray-900 border-gray-300'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Get color class based on performance class
 * @param {string} performanceClass - The performance class
 * @returns {string} Tailwind CSS color class with borders
 */
export const getPerformanceClassColor = (performanceClass) => {
  const performanceColors = {
    'performing': 'bg-green-100 text-green-800 border-green-200',
    'watch': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'substandard': 'bg-orange-100 text-orange-800 border-orange-200',
    'doubtful': 'bg-red-100 text-red-800 border-red-200',
    'loss': 'bg-red-200 text-red-900 border-red-300'
  };
  
  return performanceColors[performanceClass] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Get color class based on days overdue
 * @param {number} days - Number of days overdue
 * @returns {string} Tailwind CSS color class
 */
export const getDaysOverdueColor = (days) => {
  if (days > 90) return 'bg-red-100 text-red-800';
  if (days > 30) return 'bg-orange-100 text-orange-800';
  if (days > 0) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};

/**
 * Format date and time
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format percentage
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  if (!value || isNaN(value)) return '0.00%';
  return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Validate loan amount
 * @param {number} amount - The amount to validate
 * @param {number} minAmount - Minimum allowed amount
 * @param {number} maxAmount - Maximum allowed amount
 * @returns {string|null} Error message or null if valid
 */
export const validateLoanAmount = (amount, minAmount = 0, maxAmount = Infinity) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return 'Invalid amount';
  if (numAmount < minAmount) return `Amount must be at least ${formatCurrency(minAmount)}`;
  if (numAmount > maxAmount) return `Amount cannot exceed ${formatCurrency(maxAmount)}`;
  return null;
};

/**
 * Format phone number for Rwanda
 * @param {string} phone - The phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Rwanda phone numbers
  if (cleaned.length === 9 && cleaned.startsWith('7')) {
    return `+250 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('250')) {
    return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
  }
  
  return phone; // Return original if doesn't match expected format
};
