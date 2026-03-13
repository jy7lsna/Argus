/**
 * DeltaCalculator Utility
 * 
 * Provides pure functions to compare current and previous analysis results.
 */

const DeltaCalculator = {
  /**
   * Calculates the delta between two analyses.
   * 
   * @param {Object} current - Current analysis result
   * @param {Object} previous - Previous analysis result
   * @returns {Object} Delta report containing score difference and new critical assets
   */
  calculateDelta: (current: any, previous: any) => {
    const currentScore = current.overallRiskScore || 0;
    const previousScore = previous ? (previous.overallRiskScore || 0) : 0;
    const scoreDiff = currentScore - previousScore;
    
    // Identify new critical assets
    const currentCriticals = (current.assets || []).filter(a => a.riskLevel === 'Critical');
    const previousAssets = previous ? (previous.assets || []) : [];
    const previousCriticalUrls = previousAssets.filter(a => a.riskLevel === 'Critical').map(a => a.url);
    
    const newCriticalAssets = currentCriticals.filter(a => !previousCriticalUrls.includes(a.url));

    return {
      scoreDiff,
      scoreIncreasedSignificantly: scoreDiff >= 10,
      newCriticalAssets,
      hasNewCriticalAssets: newCriticalAssets.length > 0,
      isAlertRequired: scoreDiff >= 10 || newCriticalAssets.length > 0
    };
  }
};

export default DeltaCalculator;
