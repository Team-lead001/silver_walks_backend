import { QueryInterface, DataTypes } from 'sequelize';

export default {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        // Create enum type for user status
        await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_users_status AS ENUM('pending', 'active', 'inactive', 'suspended');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

        // Add status column to users table
        await queryInterface.sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status enum_users_status NOT NULL DEFAULT 'active';
    `);

        // Add email verification columns if they don't exist
        await queryInterface.sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT false;
    `);

        await queryInterface.sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;
    `);
    },

    down: async (queryInterface: QueryInterface): Promise<void> => {
        // Remove columns
        await queryInterface.removeColumn('users', 'status');
        await queryInterface.removeColumn('users', 'is_email_verified');
        await queryInterface.removeColumn('users', 'email_verified_at');

        // Drop enum type
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_users_status;');
    },
};
