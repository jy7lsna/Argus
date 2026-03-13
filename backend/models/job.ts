import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database';

class Job extends Model<InferAttributes<Job>, InferCreationAttributes<Job>> {
    declare id: CreationOptional<number>;
    declare type: string;
    declare data: any;
    declare status: 'pending' | 'processing' | 'completed' | 'failed';
    declare error: string | null;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Job.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    data: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'pending'
    },
    error: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    sequelize,
    modelName: 'job',
    underscored: true
});

export default Job;
