// Debug script to test loan details endpoint
const { sequelize } = require('./backend/config/database');

async function debugLoanDetails() {
    try {
        console.log('🔍 Debugging loan details endpoint...\n');
        
        // Test 1: Check if loan_files table exists
        console.log('1. Checking loan_files table:');
        try {
            const [files] = await sequelize.query('SELECT COUNT(*) as count FROM loan_files');
            console.log('✅ loan_files table exists, records:', files[0].count);
        } catch (error) {
            console.log('❌ loan_files table issue:', error.message);
        }
        
        // Test 2: Check if loan_comments table exists
        console.log('\n2. Checking loan_comments table:');
        try {
            const [comments] = await sequelize.query('SELECT COUNT(*) as count FROM loan_comments');
            console.log('✅ loan_comments table exists, records:', comments[0].count);
        } catch (error) {
            console.log('❌ loan_comments table issue:', error.message);
        }
        
        // Test 3: Check loan_types table
        console.log('\n3. Checking loan_types table:');
        try {
            const [types] = await sequelize.query('SHOW COLUMNS FROM loan_types');
            console.log('✅ loan_types columns:', types.map(col => col.Field));
        } catch (error) {
            console.log('❌ loan_types table issue:', error.message);
        }
        
        // Test 4: Try to get loan with ID 11
        console.log('\n4. Testing loan details for ID 11:');
        try {
            const [loans] = await sequelize.query(`
                SELECT 
                    l.*,
                    c.first_name as client_first_name, 
                    c.last_name as client_last_name   
                FROM loans l
                JOIN clients c ON l.client_id = c.id               
                WHERE l.id = 11
            `);
            
            if (loans.length > 0) {
                console.log('✅ Loan found:', loans[0].loan_number);
                console.log('   Client:', loans[0].client_first_name, loans[0].client_last_name);
                console.log('   Status:', loans[0].status);
            } else {
                console.log('❌ No loan found with ID 11');
            }
        } catch (error) {
            console.log('❌ Error fetching loan:', error.message);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Debug error:', error);
        process.exit(1);
    }
}

debugLoanDetails();