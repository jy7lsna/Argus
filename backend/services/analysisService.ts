import { Analysis, Asset, RiskHistory, User } from '../models';
import sequelize from '../config/database';
import ScannerService from './scannerService';

const AnalysisService = {
    /**
     * Run a domain analysis and save the results
     */
    runAnalysis: async (userId: string | number, domain: string) => {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Run analysis via scanner service
        const analysisResult = await ScannerService.analyzeDomain(domain);

        return await sequelize.transaction(async (transaction) => {
            // Save analysis to DB
            const analysis = await Analysis.create({
                domain: analysisResult.domain,
                overallRiskScore: analysisResult.overallRiskScore,
                overallRiskLevel: analysisResult.overallRiskLevel,
                totalAssets: analysisResult.totalAssets,
                criticalAssets: analysisResult.criticalAssets,
                highRiskAssets: analysisResult.highRiskAssets,
                mediumRiskAssets: analysisResult.mediumRiskAssets,
                lowRiskAssets: analysisResult.lowRiskAssets,
                user_id: user.id,
                organization_id: user.organization_id,
                analyzedAt: new Date()
            }, { transaction });

            // Save assets
            if (analysisResult.assets && analysisResult.assets.length > 0) {
                await Asset.bulkCreate(analysisResult.assets.map(asset => ({
                    ...asset,
                    analysis_id: analysis.id
                })), { transaction });
            }

            // Save risk history
            if (analysisResult.riskTrend && analysisResult.riskTrend.length > 0) {
                // For manual scans, we just record the current point
                await RiskHistory.create({
                    date: new Date().toISOString().split('T')[0],
                    score: analysisResult.overallRiskScore,
                    analysis_id: analysis.id
                }, { transaction });
            }

            // Fetch the full analysis with assets and history
            return await Analysis.findByPk(analysis.id, {
                include: [Asset, RiskHistory],
                transaction
            });
        });
    },

    /**
     * Get all analyses for a user
     */
    getUserAnalyses: async (userId: string | number) => {
        return await Analysis.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']]
        });
    },

    /**
     * Get specific analysis details
     */
    getAnalysisById: async (userId: string | number, analysisId: string | number) => {
        return await Analysis.findOne({
            where: { id: analysisId, user_id: userId },
            include: [Asset, RiskHistory]
        });
    }
};

export default AnalysisService;
