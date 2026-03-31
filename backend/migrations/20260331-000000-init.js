'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('organizations', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      organization_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'organizations', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      two_factor_secret: { type: Sequelize.STRING, allowNull: true },
      two_factor_pending_secret: { type: Sequelize.STRING, allowNull: true },
      is_two_factor_enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('analyses', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      domain: { type: Sequelize.STRING, allowNull: false },
      organization_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'organizations', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      overall_risk_score: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      overall_risk_level: { type: Sequelize.STRING, allowNull: false, defaultValue: 'Low' },
      total_assets: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      critical_assets: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      high_risk_assets: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      medium_risk_assets: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      low_risk_assets: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      analyzed_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('assets', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      analysis_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'analyses', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      name: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false },
      url: { type: Sequelize.STRING, allowNull: true },
      category: { type: Sequelize.STRING, allowNull: false, defaultValue: 'Technical' },
      exposure_score: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      exploitability_score: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      business_impact_score: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      temporal_factor: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      risk_score: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      risk_level: { type: Sequelize.STRING, allowNull: false, defaultValue: 'Low' },
      findings: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('risk_histories', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      analysis_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'analyses', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      score: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('api_keys', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      name: { type: Sequelize.STRING, allowNull: false },
      key_hash: { type: Sequelize.STRING, allowNull: false },
      last_used_at: { type: Sequelize.DATE, allowNull: true },
      expires_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('jobs', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      type: { type: Sequelize.STRING, allowNull: false },
      data: { type: Sequelize.JSONB, allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'), allowNull: false, defaultValue: 'pending' },
      error: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex('analyses', ['user_id']);
    await queryInterface.addIndex('analyses', ['domain']);
    await queryInterface.addIndex('assets', ['analysis_id']);
    await queryInterface.addIndex('risk_histories', ['analysis_id']);
    await queryInterface.addIndex('api_keys', ['user_id']);
    await queryInterface.addIndex('jobs', ['status']);
    await queryInterface.addIndex('jobs', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('jobs');
    await queryInterface.dropTable('api_keys');
    await queryInterface.dropTable('risk_histories');
    await queryInterface.dropTable('assets');
    await queryInterface.dropTable('analyses');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('organizations');
  }
};
