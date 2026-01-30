import { sequelize } from './src/config/database.config';

async function verifySchema() {
    try {
        // Check if status column exists
        const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

        console.log('Users table schema:');
        console.table(results);

        // Check migrations
        const [migrations] = await sequelize.query(`
      SELECT * FROM migrations ORDER BY executed_at;
    `);

        console.log('\nExecuted migrations:');
        console.table(migrations);

        await sequelize.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

verifySchema();
