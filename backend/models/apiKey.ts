import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database';

class ApiKey extends Model<InferAttributes<ApiKey>, InferCreationAttributes<ApiKey>> {
    declare id: CreationOptional<string>;
    declare user_id: number;
    declare name: string;
    declare key_hash: string;
    declare last_used_at: CreationOptional<Date | null>;
    declare expires_at: CreationOptional<Date | null>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

ApiKey.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    key_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_used_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    sequelize,
    modelName: 'api_key',
    underscored: true
});

export default ApiKey;
