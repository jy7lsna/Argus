import User from './user';
import Organization from './organization';
import Analysis from './analysis';
import Asset from './asset';
import RiskHistory from './risk_history';
import ApiKey from './apiKey';
import Job from './job';

// Organization - User Relationship
Organization.hasMany(User, { foreignKey: 'organization_id' });
User.belongsTo(Organization, { foreignKey: 'organization_id' });

// Organization - Analysis Relationship
Organization.hasMany(Analysis, { foreignKey: 'organization_id' });
Analysis.belongsTo(Organization, { foreignKey: 'organization_id' });

// User - Analysis Relationship
User.hasMany(Analysis, { foreignKey: 'user_id' });
Analysis.belongsTo(User, { foreignKey: 'user_id' });

// User - ApiKey Relationship
User.hasMany(ApiKey, { foreignKey: 'user_id' });
ApiKey.belongsTo(User, { foreignKey: 'user_id' });

// Analysis - Asset Relationship
Analysis.hasMany(Asset, { foreignKey: 'analysis_id' });
Asset.belongsTo(Analysis, { foreignKey: 'analysis_id' });

// Analysis - RiskHistory Relationship
Analysis.hasMany(RiskHistory, { foreignKey: 'analysis_id' });
RiskHistory.belongsTo(Analysis, { foreignKey: 'analysis_id' });

export {
    User,
    Organization,
    Analysis,
    Asset,
    RiskHistory,
    ApiKey,
    Job
};
