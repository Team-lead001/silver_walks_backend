import { QueryInterface, DataTypes } from 'sequelize';

export default {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        // Create enum type for walk session status
        await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_walk_sessions_status AS ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

        // Create walk_sessions table
        await queryInterface.createTable('walk_sessions', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            elderly_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'elderly_profiles',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            nurse_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'nurse_profiles',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            scheduled_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            scheduled_time: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            duration_minutes: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            status: {
                type: 'enum_walk_sessions_status',
                allowNull: false,
                defaultValue: 'scheduled',
            },
            route_data: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            actual_start_time: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            actual_end_time: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            distance_meters: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            steps_count: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            calories_burned: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            points_earned: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            elderly_feedback: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            nurse_feedback: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            cancellation_reason: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        });

        // Add indexes for better query performance
        await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE INDEX walk_sessions_elderly_id ON walk_sessions (elderly_id);
      EXCEPTION
        WHEN duplicate_table THEN null;
      END $$;
    `);

        await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE INDEX walk_sessions_nurse_id ON walk_sessions (nurse_id);
      EXCEPTION
        WHEN duplicate_table THEN null;
      END $$;
    `);

        await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE INDEX walk_sessions_scheduled_date ON walk_sessions (scheduled_date);
      EXCEPTION
        WHEN duplicate_table THEN null;
      END $$;
    `);

        await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE INDEX walk_sessions_status ON walk_sessions (status);
      EXCEPTION
        WHEN duplicate_table THEN null;
      END $$;
    `);
    },

    down: async (queryInterface: QueryInterface): Promise<void> => {
        // Drop table
        await queryInterface.dropTable('walk_sessions');

        // Drop enum type
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_walk_sessions_status;');
    },
};
