# Database Migrations

This folder contains all database migration files for the Silver Walks application.

## How It Works

The migration system automatically runs on application startup:

1. **Automatic Execution**: When the app starts, all pending migrations are automatically executed
2. **Tracking**: A `migrations` table tracks which migrations have been executed
3. **Skip Executed**: Already executed migrations are skipped automatically
4. **Sequential Order**: Migrations run in filename order (001_, 002_, 003_, etc.)

## Migration File Structure

Each migration file must:
- Export a default object with `up` and `down` functions
- Use sequential numbering: `001_`, `002_`, `003_`, etc.
- Have a descriptive name: `001_initial_schema.ts`, `002_add_walk_sessions.ts`, etc.

### Example Migration File

```typescript
import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    // Create tables, add columns, etc.
    await queryInterface.createTable('my_table', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    // Rollback changes
    await queryInterface.dropTable('my_table');
  },
};
```

## Creating a New Migration

1. **Create a new file** with sequential numbering:
   ```
   src/migrations/002_add_walk_sessions.ts
   ```

2. **Write up and down functions**:
   - `up`: Creates tables, adds columns, inserts data, etc.
   - `down`: Reverses the changes made in `up`

3. **Restart the app**: The migration will automatically run on next startup

## Migration Naming Convention

Use descriptive names that explain what the migration does:
- `001_initial_schema.ts` - Initial database schema
- `002_add_walk_sessions.ts` - Add walk_sessions table
- `003_add_notifications.ts` - Add notifications table
- `004_add_payments_table.ts` - Add payments table
- `005_add_indexes_for_performance.ts` - Add performance indexes

## Best Practices

1. **Never modify existing migrations** - Always create a new migration
2. **Test rollback** - Ensure `down` function properly reverses `up` changes
3. **Use transactions** - Wrap complex migrations in transactions for atomicity
4. **Order matters** - Foreign key constraints require parent tables to be created first
5. **Enum types** - Use `DO $$ BEGIN ... EXCEPTION ...` to prevent duplicate enum errors

## Current Migrations

- `001_initial_schema.ts` - Creates core tables:
  - `users` - User accounts
  - `nurse_profiles` - Nurse professional information
  - `elderly_profiles` - Elderly user profiles with subscription info
  - `health_profiles` - Health information for elderly users
  - `emergency_contacts` - Emergency contact details
  - `activity_trackers` - Tracks nurse and admin activities

## Migration Status

To check which migrations have been executed, query the `migrations` table:

```sql
SELECT * FROM migrations ORDER BY executed_at DESC;
```

## Rollback (Development Only)

To rollback the last migration (for development/testing):

```typescript
import { MigrationRunner } from './migrations';
import { sequelize } from './config/database.config';

const runner = new MigrationRunner(sequelize);
await runner.rollbackLastMigration();
```

**⚠️ Warning**: Only use rollback in development. Never rollback in production without a backup!

## Troubleshooting

### Migration Won't Run

1. Check the `migrations` table to see if it was already executed
2. Verify the file follows the naming convention (`00X_description.ts`)
3. Ensure the file exports a default object with `up` and `down` functions

### Migration Failed

1. Check the logs for the specific error
2. Fix the error in a new migration file
3. If needed, manually update the `migrations` table to remove the failed entry
4. Restart the app

### Enum Already Exists Error

Wrap enum creation in a `DO $$ BEGIN ... EXCEPTION ...` block:

```typescript
await queryInterface.sequelize.query(`
  DO $$ BEGIN
    CREATE TYPE enum_my_type AS ENUM('value1', 'value2');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
`);
```
