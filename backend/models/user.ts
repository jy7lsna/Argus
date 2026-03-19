import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>;
    declare email: string;
    declare password: string;
    declare name: string;
    declare organization_id: CreationOptional<number | null>;
    declare two_factor_secret: CreationOptional<string | null>;
    declare two_factor_pending_secret: CreationOptional<string | null>;
    declare is_two_factor_enabled: CreationOptional<boolean>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // Association virtual fields
    declare organization?: any;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    two_factor_secret: {
        type: DataTypes.STRING,
        allowNull: true
    },
    two_factor_pending_secret: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_two_factor_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    sequelize,
    modelName: 'user',
    underscored: true
});

export default User;
