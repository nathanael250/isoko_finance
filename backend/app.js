const authRoutes = require('./routes/authRoutes');
const loanRoutes = require('./routes/loans');
const clientRoutes = require('./routes/clients');
const loanTypeRoutes = require('./routes/loanTypes');
const cashierRoutes = require('./routes/cashierRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/loan-types', loanTypeRoutes);
app.use('/api/cashier', cashierRoutes); 