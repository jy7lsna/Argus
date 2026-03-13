import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database';

class Asset extends Model<InferAttributes<Asset>, InferCreationAttributes<Asset>> {
    declare id: CreationOptional<number>;
    declare analysis_id: CreationOptional<number | null>;
    declare name: string;
    declare type: string;
    declare url: CreationOptional<string | null>;
    declare category: CreationOptional<string>;
    declare exposureScore: CreationOptional<number>;
    declare exploitabilityScore: CreationOptional<number>;
    declare businessImpactScore: CreationOptional<number>;
    declare temporalFactor: CreationOptional<number>;
    declare riskScore: CreationOptional<number>;
    declare riskLevel: CreationOptional<string>;
    declare findings: CreationOptional<any[]>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Asset.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    analysis_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'Technical'
    },
    exposureScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    exploitabilityScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    businessImpactScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    temporalFactor: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    riskScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    riskLevel: {
        type: DataTypes.STRING,
        defaultValue: 'Low'
    },
    findings: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    sequelize,
    modelName: 'asset',
    underscored: true
});

export default Asset;
