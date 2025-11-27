import { sequelize } from '../config/database.config';
import { logger } from '../utils/logger.util';

/**
 * Script to check migration status
 */
async function checkMigrations() {
  try {
    await sequelize.authenticate();
    
    // Check migrations table
    const [migrations] = await sequelize.query('SELECT * FROM migrations ORDER BY executed_at');
    
    console.log('\n📋 Executed Migrations:');
    console.log('=====================');
    if (Array.isArray(migrations) && migrations.length > 0) {
      migrations.forEach((m: any) => {
        console.log(`✓ ${m.name} - executed at ${m.executed_at}`);
      });
    } else {
      console.log('No migrations executed yet');
    }
    
    // Check if tables exist
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📦 Database Tables:');
    console.log('==================');
    if (Array.isArray(tables)) {
      tables.forEach((t: any) => {
        console.log(`- ${t.table_name}`);
      });
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    logger.error('Failed to check migrations', error as Error);
    process.exit(1);
  }
}

checkMigrations();
