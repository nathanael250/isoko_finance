const crypto = require('crypto');

/**
 * Generate a unique ID with prefix
 * @param {string} prefix - The prefix for the ID (e.g., 'CLT', 'USR', 'LN')
 * @param {number} length - The length of the random part (default: 8)
 * @returns {string} - Generated unique ID
 */
const generateId = (prefix = '', length = 8) => {
    const timestamp = Date.now().toString(36); // Convert timestamp to base36
    const randomPart = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);

    return `${prefix}${timestamp}${randomPart}`.toUpperCase();
};

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the random string
 * @returns {string} - Random string
 */
const generateRandomString = (length = 10) => {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

/**
 * Generate a random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random number
 */
const generateRandomNumber = (min = 1000, max = 9999) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Format currency to Nigerian Naira
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
        return '₦0.00';
    }

    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2
    }).format(amount);
};

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'en-NG')
 * @returns {string} - Formatted date string
 */
const formatDate = (date, locale = 'en-NG') => {
    if (!date) return '';

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Format date and time to readable string
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'en-NG')
 * @returns {string} - Formatted date and time string
 */
const formatDateTime = (date, locale = 'en-NG') => {
    if (!date) return '';

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    return dateObj.toLocaleString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Calculate age from date of birth
 * @param {Date|string} dateOfBirth - Date of birth
 * @returns {number} - Age in years
 */
const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

/**
 * Validate Nigerian phone number
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidNigerianPhone = (phoneNumber) => {
    if (!phoneNumber) return false;

    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Check for valid Nigerian phone number patterns
    const patterns = [
        /^234[789][01]\d{8}$/, // +234 format
        /^0[789][01]\d{8}$/,   // 0 format
        /^[789][01]\d{8}$/     // Without country code or leading 0
    ];

    return patterns.some(pattern => pattern.test(cleaned));
};

/**
 * Format Nigerian phone number to standard format
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} - Formatted phone number
 */
const formatNigerianPhone = (phoneNumber) => {
    if (!phoneNumber) return '';

    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Convert to standard format (0XXXXXXXXXX)
    if (cleaned.startsWith('234')) {
        return '0' + cleaned.substring(3);
    } else if (cleaned.startsWith('0')) {
        return cleaned;
    } else if (cleaned.length === 10) {
        return '0' + cleaned;
    }

    return phoneNumber; // Return original if can't format
};

/**
 * Sanitize filename for safe storage
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
const sanitizeFilename = (filename) => {
    if (!filename) return '';

    // Remove path separators and dangerous characters
    return filename
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
};

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} - File extension (without dot)
 */
const getFileExtension = (filename) => {
    if (!filename) return '';

    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot + 1).toLowerCase();
};

/**
 * Convert bytes to human readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} - Human readable size
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 12)
 * @returns {string} - Generated password
 */
const generateSecurePassword = (length = 12) => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidEmail = (email) => {
    if (!email) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
const capitalizeWords = (str) => {
    if (!str) return '';

    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Remove sensitive data from user object
 * @param {Object} user - User object
 * @returns {Object} - User object without sensitive data
 */
const sanitizeUser = (user) => {
    if (!user) return null;

    const { password, reset_token, reset_token_expires, ...sanitizedUser } = user;
    return sanitizedUser;
};

/**
 * Calculate loan payment amount
 * @param {number} principal - Loan principal amount
 * @param {number} rate - Annual interest rate (as percentage)
 * @param {number} term - Loan term in months
 * @returns {number} - Monthly payment amount
 */
const calculateLoanPayment = (principal, rate, term) => {
    if (!principal || !rate || !term) return 0;

    const monthlyRate = rate / 100 / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) /
        (Math.pow(1 + monthlyRate, term) - 1);

    return Math.round(payment * 100) / 100; // Round to 2 decimal places
};

/**
 * Generate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} - Pagination metadata
 */
const generatePagination = (page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
        current_page: page,
        per_page: limit,
        total_items: total,
        total_pages: totalPages,
        has_next: hasNext,
        has_prev: hasPrev,
        next_page: hasNext ? page + 1 : null,
        prev_page: hasPrev ? page - 1 : null
    };
};

module.exports = {
    generateId,
    generateRandomString,
    generateRandomNumber,
    formatCurrency,
    formatDate,
    formatDateTime,
    calculateAge,
    isValidNigerianPhone,
    formatNigerianPhone,
    sanitizeFilename,
    getFileExtension,
    formatFileSize,
    generateSecurePassword,
    isValidEmail,
    capitalizeWords,
    sanitizeUser,
    calculateLoanPayment,
    generatePagination
};
