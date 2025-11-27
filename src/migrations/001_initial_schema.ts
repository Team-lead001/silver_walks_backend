import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    // Create enum types first
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_users_role AS ENUM('admin', 'elderly', 'nurse');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_elderly_profiles_subscription_plan AS ENUM('BASIC', 'PREMIUM', 'GOLD');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_elderly_profiles_subscription_status AS ENUM('ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_health_profiles_mobility_level AS ENUM('INDEPENDENT', 'ASSISTED', 'WHEELCHAIR', 'UNKNOWN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: 'enum_users_role',
        allowNull: false,
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
      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    });

    // Create nurse_profiles table
    await queryInterface.createTable('nurse_profiles', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      profile_picture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      certifications: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      years_of_experience: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total_walks: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      points_earned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      points_withdrawn: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    // Create elderly_profiles table
    await queryInterface.createTable('elderly_profiles', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      profile_picture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      health_profile_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      assigned_nurse_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'nurse_profiles',
          key: 'id',
        },
      },
      subscription_plan: {
        type: 'enum_elderly_profiles_subscription_plan',
        allowNull: false,
      },
      subscription_status: {
        type: 'enum_elderly_profiles_subscription_status',
        allowNull: false,
      },
      subscription_start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      subscription_end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      walks_remaining: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      walks_used_this_month: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    // Create health_profiles table
    await queryInterface.createTable('health_profiles', {
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
      mobility_level: {
        type: 'enum_health_profiles_mobility_level',
        allowNull: false,
      },
      medical_conditions: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
        allowNull: true,
        defaultValue: [],
      },
      medications: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
        allowNull: true,
        defaultValue: [],
      },
      allergies: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      dietary_restrictions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      emergency_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      last_checkup_date: {
        type: DataTypes.DATE,
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

    // Create emergency_contacts table
    await queryInterface.createTable('emergency_contacts', {
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      relationship: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    // Create activity_trackers table
    await queryInterface.createTable('activity_trackers', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      user_role: {
        type: 'enum_users_role',
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      endpoint: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      resource_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resource_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      request_body: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      response_status: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
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

    // Add indexes for better performance (with IF NOT EXISTS check)
    // PostgreSQL doesn't support IF NOT EXISTS for indexes directly, so we use raw SQL with DO blocks
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE INDEX users_email ON users (email);
      EXCEPTION
        WHEN duplicate_table THEN null;
      END $$;
    `);
    
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE INDEX elderly_profiles_user_id ON elderly_profiles (user_id);
      EXCEPTION
        WHEN duplicate_table THEN null;
      END $$;
    `);
    
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE INDEX nurse_profiles_user_id ON nurse_profiles (user_id);
      EXCEPTION
        WHEN duplicate_table THEN null;
      END $$;
    `);
    
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE INDEX health_profiles_elderly_id ON health_profiles (elderly_id);
      EXCEPTION
        WHEN duplicate_table THEN null;
      END $$;
    `);
    
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE INDEX emergency_contacts_elderly_id ON emergency_contacts (elderly_id);
      EXCEPTION
        WHEN duplicate_table THEN null;
      END $$;
    `);
    
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE INDEX activity_trackers_user_id ON activity_trackers (user_id);
      EXCEPTION
        WHEN duplicate_table THEN null;
      END $$;
    `);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    // Drop tables in reverse order
    await queryInterface.dropTable('activity_trackers');
    await queryInterface.dropTable('emergency_contacts');
    await queryInterface.dropTable('health_profiles');
    await queryInterface.dropTable('elderly_profiles');
    await queryInterface.dropTable('nurse_profiles');
    await queryInterface.dropTable('users');

    // Drop enum types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_users_role;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_elderly_profiles_subscription_plan;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_elderly_profiles_subscription_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_health_profiles_mobility_level;');
  },
};
