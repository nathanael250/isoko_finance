const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();


const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
// Temporarily comment out client routes until auth is working
const clientRoutes = require('./routes/clients');
const loanRoutes = require('./routes/loans');
const loanTypeRoutes = require('./routes/loanTypes');
const loanDetailsRoutes = require('./routes/loanDetails');
const repaymentRoutes = require('./routes/repayments');
const dueLoansRoutes = require('./routes/dueLoans');
const missedRepaymentsRoutes = require('./routes/missedRepayments');
const { startScheduler } = require('./utils/scheduler');
const loansInArrearsRoutes = require('./routes/loansInArrears');
const pastMaturityRoutes = require('./routes/pastMaturity');
const principalOutstandingRoutes = require('./routes/principalOutstanding');
const loanCalculatorRouter = require('./routes/loanCalculator');
const guarantorRoutes = require('./routes/guarantors');
const dashboardRoutes = require('./routes/dashboard');


// Connect to database
connectDB().then(()=>{
    startScheduler();
});


const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later'
    }
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Static files middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Isoko Finance API is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: 'MySQL'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes); // Temporarily commented out
app.use('/api/loans', loanRoutes);
app.use('/api/loans', loanDetailsRoutes);
app.use('/api/repayments', repaymentRoutes);
app.use('/api/due-loans', dueLoansRoutes);
app.use('/api/missed-repayments', missedRepaymentsRoutes);
app.use('/api/loans-in-arrears', loansInArrearsRoutes);
app.use('/api/past-maturity', pastMaturityRoutes);
app.use('/api/principal-outstanding', principalOutstandingRoutes);
app.use('/api/loan-calculator', loanCalculatorRouter);
app.use('/api/guarantors', guarantorRoutes);
app.use('/api/dashboard', dashboardRoutes);


// 404 handler for undefined routes






// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        success: false,
        message: err.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📊 Using MySQL database`);
    console.log(`📁 File uploads directory: ${path.join(__dirname, 'uploads')}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});

module.exports = app;
