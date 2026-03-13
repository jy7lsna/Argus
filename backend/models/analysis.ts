import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database';

class Analysis extends Model<InferAttributes<Analysis>, InferCreationAttributes<Analysis>> {
    declare id: CreationOptional<number>;
    declare domain: string;
    declare organization_id: CreationOptional<number | null>;
    declare user_id: CreationOptional<number | null>;
    declare overallRiskScore: CreationOptional<number>;
    declare overallRiskLevel: CreationOptional<string>;
    declare totalAssets: CreationOptional<number>;
    declare criticalAssets: CreationOptional<number>;
    declare highRiskAssets: CreationOptional<number>;
    declare mediumRiskAssets: CreationOptional<number>;
    declare lowRiskAssets: CreationOptional<number>;
    declare analyzedAt: CreationOptional<Date>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Analysis.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    domain: {
        type: DataTypes.STRING,
        allowNull: false
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    overallRiskScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    overallRiskLevel: {
        type: DataTypes.STRING,
        defaultValue: 'Low'
    },
    totalAssets: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    criticalAssets: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    highRiskAssets: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    mediumRiskAssets: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lowRiskAssets: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    analyzedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    sequelize,
    modelName: 'analysis',
    underscored: true
});

export default Analysis;
