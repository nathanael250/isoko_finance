// Currency formatter
export const formatCurrency = (amount, currency = 'RWF') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency} 0`;
  }
  
  const numAmount = Number(amount);
  return `${currency} ${numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
};

// Number formatter
export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  return Number(number).toLocaleString('en-US');
};

// Percentage formatter
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return `${Number(value).toFixed(decimals)}%`;
};

// Date formatter
export const formatDate = (date, options = {}) => {
  if (!date) return '-';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  try {
    return new Date(date).toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    return '-';
  }
};

// DateTime formatter
export const formatDateTime = (date) => {
  if (!date) return '-';
  
  try {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '-';
  }
};

// Relative time formatter (e.g., "2 days ago")
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  
  try {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now - targetDate) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return formatDate(date);
    }
  } catch (error) {
    return '-';
  }
};

// Phone number formatter
export const formatPhoneNumber = (phone) => {
  if (!phone) return '-';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format for Rwanda numbers (starting with 250)
  if (cleaned.startsWith('250') && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  
  // Format for local numbers (starting with 07/08/09)
  if (cleaned.length === 10 && /^0[789]/.test(cleaned)) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
};

// Status formatter with colors
export const formatStatus = (status) => {
  if (!status) return { text: '-', color: 'gray' };
  
  const statusMap = {
    // Loan statuses
    'pending': { text: 'Pending', color: 'yellow' },
    'approved': { text: 'Approved', color: 'blue' },
    'disbursed': { text: 'Disbursed', color: 'green' },
    'active': { text: 'Active', color: 'green' },
    'completed': { text: 'Completed', color: 'blue' },
    'defaulted': { text: 'Defaulted', color: 'red' },
    'rejected': { text: 'Rejected', color: 'red' },
    'cancelled': { text: 'Cancelled', color: 'gray' },
    
    // Payment statuses
    'paid': { text: 'Paid', color: 'green' },
    'partial': { text: 'Partial', color: 'yellow' },
    'overdue': { text: 'Overdue', color: 'red' },
    'confirmed': { text: 'Confirmed', color: 'green' },
    
    // Performance classes
    'performing': { text: 'Performing', color: 'green' },
    'watch': { text: 'Watch', color: 'yellow' },
    'substandard': { text: 'Substandard', color: 'orange' },
    'doubtful': { text: 'Doubtful', color: 'red' },
    'loss': { text: 'Loss', color: 'red' },
    
    // User statuses
    'active_user': { text: 'Active', color: 'green' },
    'inactive_user': { text: 'Inactive', color: 'gray' },
    'suspended': { text: 'Suspended', color: 'red' },
  };
  
  return statusMap[status.toLowerCase()] || { text: status, color: 'gray' };
};

// Risk level formatter
export const formatRiskLevel = (daysOverdue) => {
  if (daysOverdue <= 0) return { text: 'No Risk', color: 'green' };
  if (daysOverdue <= 30) return { text: 'Low Risk', color: 'yellow' };
  if (daysOverdue <= 90) return { text: 'Medium Risk', color: 'orange' };
  if (daysOverdue <= 180) return { text: 'High Risk', color: 'red' };
  return { text: 'Critical Risk', color: 'red' };
};

// Priority formatter
export const formatPriority = (priority) => {
  const priorityMap = {
    'low': { text: 'Low', color: 'green' },
    'medium': { text: 'Medium', color: 'yellow' },
    'high': { text: 'High', color: 'orange' },
    'urgent': { text: 'Urgent', color: 'red' },
    'critical': { text: 'Critical', color: 'red' }
  };
  
  return priorityMap[priority?.toLowerCase()] || { text: priority || '-', color: 'gray' };
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Loan term formatter
export const formatLoanTerm = (term, termType = 'months') => {
  if (!term) return '-';
  
  const termMap = {
    'days': term === 1 ? 'day' : 'days',
    'weeks': term === 1 ? 'week' : 'weeks', 
    'months': term === 1 ? 'month' : 'months',
    'years': term === 1 ? 'year' : 'years'
  };
  
  return `${term} ${termMap[termType] || termType}`;
};

// Interest rate formatter
export const formatInterestRate = (rate, period = 'annual') => {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return '0%';
  }
  
  const periodMap = {
    'daily': '/day',
    'weekly': '/week',
    'monthly': '/month',
    'annual': '/year',
    'yearly': '/year'
  };
  
  return `${Number(rate).toFixed(2)}%${periodMap[period] || ''}`;
};

// Compact number formatter (1K, 1M, etc.)
export const formatCompactNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  const num = Number(number);
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  
  return num.toLocaleString();
};

// Days overdue formatter with color coding
export const formatDaysOverdue = (days) => {
  if (!days || days <= 0) {
    return { text: 'Current', color: 'green' };
  }
  
  let color = 'green';
  if (days > 90) color = 'red';
  else if (days > 30) color = 'orange';
  else if (days > 7) color = 'yellow';
  
  return {
    text: `${days} day${days > 1 ? 's' : ''} overdue`,
    color
  };
};

// Default export with all formatters
export default {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatPhoneNumber,
  formatStatus,
  formatRiskLevel,
  formatPriority,
  formatFileSize,
  formatLoanTerm,
  formatInterestRate,
  formatCompactNumber,
  formatDaysOverdue
};
