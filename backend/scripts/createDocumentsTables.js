const { sequelize } = require('../config/database');

async function createDocumentsTables() {
    try {
        console.log('Creating loan documents and comments tables...');

        // Create loan_documents table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS loan_documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                loan_id INT NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_size INT,
                document_type ENUM('id_card', 'passport', 'utility_bill', 'bank_statement', 'business_license', 'collateral_document', 'other') DEFAULT 'other',
                description TEXT,
                is_verified BOOLEAN DEFAULT FALSE,
                uploaded_by INT,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                verified_by INT NULL,
                verified_at TIMESTAMP NULL,
                FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
                FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_loan_documents_loan_id (loan_id),
                INDEX idx_loan_documents_type (document_type)
            )
        `);

        // Create loan_comments table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS loan_comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                loan_id INT NOT NULL,
                comment TEXT NOT NULL,
                comment_type ENUM('general', 'loan_officer_note', 'client_interaction', 'approval_decision') DEFAULT 'general',
                is_internal BOOLEAN DEFAULT TRUE,
                priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_loan_comments_loan_id (loan_id),
                INDEX idx_loan_comments_type (comment_type),
                INDEX idx_loan_comments_created_at (created_at)
            )
        `);

        console.log('✅ Tables created successfully!');
        console.log('✅ loan_documents table ready');
        console.log('✅ loan_comments table ready');

    } catch (error) {
        console.error('❌ Error creating tables:', error);
        throw error;
    }
}

// Run the function if this script is executed directly
if (require.main === module) {
    createDocumentsTables()
        .then(() => {
            console.log('Database setup complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database setup failed:', error);
            process.exit(1);
        });
}

module.exports = { createDocumentsTables };