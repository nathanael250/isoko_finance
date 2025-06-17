require('dotenv').config();
const mysql = require('mysql2/promise');

async function testWithIP() {
    console.log('Testing with IP address directly...');
    
    try {
        const connection = await mysql.createConnection({
            host: '52.29.239.198',  // Use IP directly
            port: 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false },
            connectTimeout: 60000
        });
        
        console.log('✅ IP connection successful!');
        
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Query successful:', rows);
        
        await connection.end();
        return true;
    } catch (error) {
        console.error('❌ IP connection failed:', error.message);
        console.error('Error code:', error.code);
        return false;
    }
}

testWithIP();
