// Simple test script to check if API endpoints are working
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const LOAN_ID = 1; // Replace with a valid loan ID from your database

async function testEndpoints() {
    try {
        console.log('🧪 Testing API Endpoints...\n');

        // Test 1: Get loan details (should include documents and comments)
        console.log('1. Testing GET /loans/:id/details');
        try {
            const loanResponse = await axios.get(`${API_BASE}/loans/${LOAN_ID}/details`);
            console.log('✅ Loan details response status:', loanResponse.status);
            console.log('📊 Response data structure:');
            console.log('   - Loan ID:', loanResponse.data.data?.loan?.id);
            console.log('   - Documents count:', loanResponse.data.data?.documents?.length || 0);
            console.log('   - Comments count:', loanResponse.data.data?.comments?.length || 0);
            console.log('   - Schedule count:', loanResponse.data.data?.schedule?.length || 0);
            console.log('   - Repayments count:', loanResponse.data.data?.repayments?.length || 0);
        } catch (error) {
            console.log('❌ Loan details error:', error.response?.data || error.message);
        }

        console.log('\n2. Testing GET /loans/:loanId/documents');
        try {
            const docsResponse = await axios.get(`${API_BASE}/loans/${LOAN_ID}/documents`);
            console.log('✅ Documents response status:', docsResponse.status);
            console.log('📄 Documents found:', docsResponse.data.data?.length || 0);
        } catch (error) {
            console.log('❌ Documents error:', error.response?.data || error.message);
        }

        console.log('\n3. Testing GET /loans/:loanId/comments');
        try {
            const commentsResponse = await axios.get(`${API_BASE}/loans/${LOAN_ID}/comments`);
            console.log('✅ Comments response status:', commentsResponse.status);
            console.log('💬 Comments found:', commentsResponse.data.data?.length || 0);
        } catch (error) {
            console.log('❌ Comments error:', error.response?.data || error.message);
        }

    } catch (error) {
        console.log('❌ General error:', error.message);
    }
}

console.log('Make sure your backend server is running on http://localhost:5000');
console.log(`Testing with LOAN_ID = ${LOAN_ID}`);
console.log('Change LOAN_ID in this script if needed.\n');

testEndpoints();