import { Sequelize } from 'sequelize';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not defined in the environment variables.');
  process.exit(1);
}

const dbSslRejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries during development
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  },
  dialectOptions: (databaseUrl.includes('localhost') || databaseUrl.includes('@db:')) ? {} : {
    ssl: {
      require: true,
      rejectUnauthorized: dbSslRejectUnauthorized
    }
  }
});

export default sequelize;
