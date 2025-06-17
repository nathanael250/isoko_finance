require('dotenv').config();
const mysql = require('mysql2/promise');

async function testAfterWhitelist() {
    console.log('Testing connection after IP whitelist...');
    console.log('Your IP: 197.157.187.161');
    
    // Test 1: With hostname
    try {
        console.log('\n🔍 Testing with hostname...');
        const connection1 = await mysql.createConnection({
            host: 'sql7.freesqldatabase.com',
            port: 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false },
            connectTimeout: 60000
        });
        
        console.log('✅ Hostname connection successful!');
        const [rows1] = await connection1.execute('SELECT 1 as test');
        console.log('✅ Query successful:', rows1);
        await connection1.end();
        
    } catch (error1) {
        console.error('❌ Hostname connection failed:', error1.message);
        console.error('Error code:', error1.code);
    }
    
    // Test 2: With IP address
    try {
        console.log('\n🔍 Testing with IP address...');
        const connection2 = await mysql.createConnection({
            host: '52.29.239.198',
            port: 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false },
            connectTimeout: 60000
        });
        
        console.log('✅ IP connection successful!');
        const [rows2] = await connection2.execute('SELECT 1 as test');
        console.log('✅ Query successful:', rows2);
        await connection2.end();
        
    } catch (error2) {
        console.error('❌ IP connection failed:', error2.message);
        console.error('Error code:', error2.code);
    }
}

testAfterWhitelist();