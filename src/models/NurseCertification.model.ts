import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import NurseProfile from './NurseProfile.model';

interface NurseCertificationAttributes {
    id: string;
    nurse_profile_id: string;
    name: string;
    issuer: string;
    issue_date: Date;
    expiry_date?: Date;
    created_at: Date;
    updated_at: Date;
}

interface NurseCertificationCreationAttributes extends Optional<NurseCertificationAttributes, 'id' | 'created_at' | 'updated_at' | 'expiry_date'> { }

class NurseCertification extends Model<NurseCertificationAttributes, NurseCertificationCreationAttributes> implements NurseCertificationAttributes {
    public id!: string;
    public nurse_profile_id!: string;
    public name!: string;
    public issuer!: string;
    public issue_date!: Date;
    public expiry_date?: Date;
    public created_at!: Date;
    public updated_at!: Date;
}

NurseCertification.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        nurse_profile_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'nurse_profiles',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        issuer: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        issue_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        expiry_date: {
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
    },
    {
        sequelize,
        tableName: 'nurse_certifications',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default NurseCertification;
