const axios = require('axios');

// Test the API without authentication (will fail but we can see structure)
async function testAPI() {
    console.log('🧪 Testing API Structure...\n');
    
    try {
        // Test loan details endpoint
        const response = await axios.get('http://localhost:5000/api/loans/5/details');
        console.log('✅ Success! Response structure:');
        console.log('Status:', response.status);
        console.log('Success:', response.data.success);
        console.log('Data keys:', Object.keys(response.data.data || {}));
        
        if (response.data.data) {
            console.log('Documents count:', response.data.data.documents?.length || 0);
            console.log('Comments count:', response.data.data.comments?.length || 0);
            console.log('Loan ID:', response.data.data.loan?.id);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.response?.status || error.message);
        if (error.response?.status === 401) {
            console.log('📝 This is expected - authentication required');
        } else {
            console.log('Error details:', error.response?.data || error.message);
        }
    }
}

testAPI();