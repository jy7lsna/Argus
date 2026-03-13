/**
 * RiskEngine Service
 * 
 * Provides pure functions for calculating risk scores and levels.
 */

const RiskEngine = {
    /**
     * Calculates the risk score for a single asset based on weighted factors.
     * 
     * Weighting:
     * - 35% Exposure
     * - 30% Exploitability
     * - 25% Business Impact
     * - 10% Temporal Factor
     * 
     * @param {Object} scores - Object containing individual scores (0-100)
     * @returns {number} Calculated risk score (rounded to integer)
     */
    calculateAssetScore: ({ exposureScore, exploitabilityScore, businessImpactScore, temporalFactor }: any, assetType?: string, assetName?: string) => {
        let typeWeight = 1.0;
        let multiplier = 1.0;

        // Implement weighted risk based on asset type
        if (assetType) {
            const type = assetType.toLowerCase();
            if (type.includes('database')) typeWeight = 1.5;
            if (type.includes('api')) typeWeight = 1.3;
            if (type.includes('storage')) typeWeight = 1.2;
            if (type.includes('network device')) typeWeight = 1.4;
            if (type.includes('config')) typeWeight = 1.1;
        }

        // Sensitive pattern detection (High-value targets)
        if (assetName) {
            const name = assetName.toLowerCase();
            const sensitiveKeywords = ['vault', 'prod', 'internal', 'admin', 'db', 'master', 'auth', 'secret'];
            if (sensitiveKeywords.some(key => name.includes(key))) {
                multiplier = 1.5;
            }
        }

        const weightedScore =
            ((0.35 * exposureScore) +
                (0.30 * exploitabilityScore) +
                (0.25 * businessImpactScore) +
                (0.10 * temporalFactor)) * typeWeight * multiplier;

        return Math.min(100, Math.round(weightedScore));
    },

    /**
     * Categorizes a numeric score into a risk level.
     * 
     * Categories:
     * - 0-30: Low
     * - 31-60: Medium
     * - 61-80: High
     * - 81-100: Critical
     * 
     * @param {number} score - Numeric risk score (0-100)
     * @returns {string} Risk level category
     */
    getRiskLevel: (score: number) => {
        if (score <= 30) return 'Low';
        if (score <= 60) return 'Medium';
        if (score <= 80) return 'High';
        return 'Critical';
    },

    /**
     * Calculates the overall risk score for an analysis based on its assets.
     * Currently uses a simple weighted average of all asset scores.
     * 
     * @param {Array} assets - Array of asset objects with riskScore
     * @returns {number} Overall risk score
     */
    calculateOverallScore: (assets: any[]) => {
        if (!assets || assets.length === 0) return 0;

        const sum = assets.reduce((acc, asset) => acc + asset.riskScore, 0);
        return Math.round(sum / assets.length);
    }
};

export default RiskEngine;
