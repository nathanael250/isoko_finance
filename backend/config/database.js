const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        },
        // Add MariaDB specific options
        dialectOptions: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            // Prevent timeout issues
            acquireTimeout: 60000,
            timeout: 60000
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Database connected successfully');

        if (process.env.NODE_ENV === 'development') {
            // Check if tables exist before syncing to prevent duplicate indexes
            try {
                const [results] = await sequelize.query("SHOW TABLES LIKE 'users'");
                
                if (results.length === 0) {
                    // Tables don't exist, create them
                    console.log('📊 Creating database tables...');
                    await sequelize.sync({ force: false });
                    console.log('✅ Database tables created successfully');
                } else {
                    // Tables exist, just validate connection
                    console.log('📊 Database tables already exist, skipping sync');
                    console.log('🔗 Database connection validated');
                }
            } catch (syncError) {
                console.error('⚠️ Database sync error:', syncError.message);
                // Don't exit, just log the error
            }
        }
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        process.exit(1);
    }
};

// Function to force reset database (use carefully!)
const resetDatabase = async () => {
    try {
        console.log('🔄 Resetting database...');
        await sequelize.drop();
        console.log('🗑️ All tables dropped');
        
        await sequelize.sync({ force: true });
        console.log('✅ Database reset complete');
        
        return true;
    } catch (error) {
        console.error('❌ Reset failed:', error);
        return false;
    }
};

// Function to manually sync (for migrations)
const manualSync = async (options = {}) => {
    try {
        console.log('🔄 Manual database sync...');
        await sequelize.sync(options);
        console.log('✅ Manual sync complete');
        return true;
    } catch (error) {
        console.error('❌ Manual sync failed:', error);
        return false;
    }
};

module.exports = { 
    sequelize, 
    connectDB, 
    resetDatabase, 
    manualSync 
};
