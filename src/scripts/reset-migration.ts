import { sequelize } from '../config/database.config';
import { logger } from '../utils/logger.util';

/**
 * Script to reset a failed migration
 * Usage: npx ts-node src/scripts/reset-migration.ts <migration-name>
 */
async function resetMigration() {
  const migrationName = process.argv[2];

  if (!migrationName) {
    console.error('❌ Please provide a migration name');
    console.log('Usage: npx ts-node src/scripts/reset-migration.ts 001_initial_schema.ts');
    process.exit(1);
  }

  try {
    // Connect to database
    await sequelize.authenticate();
    logger.info('Connected to database');

    // Delete migration record
    const [result] = await sequelize.query(
      'DELETE FROM migrations WHERE name = ? RETURNING *',
      {
        replacements: [migrationName],
      }
    );

    if (Array.isArray(result) && result.length > 0) {
      logger.info(`✅ Successfully removed migration record: ${migrationName}`);
    } else {
      logger.warn(`⚠️  No migration record found for: ${migrationName}`);
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    logger.error('Failed to reset migration', error as Error);
    process.exit(1);
  }
}

resetMigration();
