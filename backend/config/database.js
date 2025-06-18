const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        
        pool: {
            max: 5,
            min: 0,
            acquire: 60000,
            idle: 10000
        },
        
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        },
        
        // ✅ Simplified - no SSL at all
        dialectOptions: {
            charset: 'utf8mb4'
            // Remove SSL completely
        }
    }
);

const connectDB = async () => {
    try {
        console.log('🔗 Connecting to database...');
        console.log(`📍 Host: ${process.env.DB_HOST}`);
        console.log(`📊 Database: ${process.env.DB_NAME}`);
        console.log(`👤 User: ${process.env.DB_USER}`);
        
        await sequelize.authenticate();
        console.log('✅ MySQL Database connected successfully');
        
        if (process.env.NODE_ENV === 'development') {
            try {
                const [results] = await sequelize.query("SELECT 1 as test");
                console.log('✅ Database query test successful');
                
                const [tables] = await sequelize.query("SHOW TABLES LIKE 'users'");
                
                if (tables.length === 0) {
                    console.log('📊 Creating database tables...');
                    await sequelize.sync({ force: false });
                    console.log('✅ Database tables created successfully');
                } else {
                    console.log('📊 Database tables already exist, skipping sync');
                }
            } catch (syncError) {
                console.error('⚠️ Database sync error:', syncError.message);
            }
        }
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        console.error('Full error:', error);
        
        if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Continuing in development mode despite DB error');
        } else {
            process.exit(1);
        }
    }
};

module.exports = {
    sequelize,
    connectDB
};
