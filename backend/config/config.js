require('dotenv/config');

const databaseUrl = process.env.DATABASE_URL || '';
const dbSslRejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';
const shouldUseSsl = databaseUrl && !databaseUrl.includes('localhost') && !databaseUrl.includes('@db:');

const dialectOptions = shouldUseSsl ? {
  ssl: {
    require: true,
    rejectUnauthorized: dbSslRejectUnauthorized
  }
} : {};

module.exports = {
  development: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions
  },
  test: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions
  }
};
