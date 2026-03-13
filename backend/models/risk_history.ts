import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database';

class RiskHistory extends Model<InferAttributes<RiskHistory>, InferCreationAttributes<RiskHistory>> {
    declare id: CreationOptional<number>;
    declare analysis_id: CreationOptional<number | null>;
    declare date: string;
    declare score: number;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

RiskHistory.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    analysis_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    sequelize,
    modelName: 'risk_history',
    underscored: true
});

export default RiskHistory;
