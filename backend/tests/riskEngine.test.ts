/**
 * Unit tests for RiskEngine
 */
import RiskEngine from '../services/riskEngine';

function testRiskEngine() {
  console.log('--- Testing RiskEngine ---');
  
  // Test Case 1: Balanced scores
  const balancedScores = {
    exposureScore: 50,
    exploitabilityScore: 50,
    businessImpactScore: 50,
    temporalFactor: 50
  };
  const balancedResult = RiskEngine.calculateAssetScore(balancedScores);
  console.log(`Test 1 (Balanced): Expected 50, Got ${balancedResult}`);
  console.assert(balancedResult === 50, 'Test 1 Failed');

  // Test Case 2: Weighted calculation
  // (0.35 * 100) + (0.30 * 0) + (0.25 * 0) + (0.10 * 0) = 35
  const weightedScores = {
    exposureScore: 100,
    exploitabilityScore: 0,
    businessImpactScore: 0,
    temporalFactor: 0
  };
  const weightedResult = RiskEngine.calculateAssetScore(weightedScores);
  console.log(`Test 2 (Exposure weighted): Expected 35, Got ${weightedResult}`);
  console.assert(weightedResult === 35, 'Test 2 Failed');

  // Test Case 3: Risk Level Categorization
  console.log(`Test 3.1 (Low): ${RiskEngine.getRiskLevel(25)}`);
  console.assert(RiskEngine.getRiskLevel(25) === 'Low', 'Test 3.1 Failed');
  
  console.log(`Test 3.2 (Medium): ${RiskEngine.getRiskLevel(45)}`);
  console.assert(RiskEngine.getRiskLevel(45) === 'Medium', 'Test 3.2 Failed');
  
  console.log(`Test 3.3 (High): ${RiskEngine.getRiskLevel(75)}`);
  console.assert(RiskEngine.getRiskLevel(75) === 'High', 'Test 3.3 Failed');
  
  console.log(`Test 3.4 (Critical): ${RiskEngine.getRiskLevel(90)}`);
  console.assert(RiskEngine.getRiskLevel(90) === 'Critical', 'Test 3.4 Failed');

  // Test Case 4: Overall score calculation
  const mockAssets = [
    { riskScore: 20 },
    { riskScore: 80 }
  ];
  const overallResult = RiskEngine.calculateOverallScore(mockAssets);
  console.log(`Test 4 (Overall): Expected 50, Got ${overallResult}`);
  console.assert(overallResult === 50, 'Test 4 Failed');

  console.log('--- RiskEngine Tests Completed ---');
}

testRiskEngine();
