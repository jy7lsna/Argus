const DeltaCalculator = require('../utils/deltaCalculator');

function testDeltaCalculator() {
  console.log('--- Testing DeltaCalculator ---');

  const previous = {
    overallRiskScore: 50,
    assets: [
      { url: 'site1.com', riskLevel: 'Critical' },
      { url: 'site2.com', riskLevel: 'Low' }
    ]
  };

  const currentNoChange = {
    overallRiskScore: 52,
    assets: [
      { url: 'site1.com', riskLevel: 'Critical' },
      { url: 'site2.com', riskLevel: 'Low' }
    ]
  };

  const currentBigScoreIncrease = {
    overallRiskScore: 65,
    assets: previous.assets
  };

  const currentNewCritical = {
    overallRiskScore: 52,
    assets: [
      ...previous.assets,
      { url: 'evil-site.com', riskLevel: 'Critical' }
    ]
  };

  // Test 1: No alert required
  const d1 = DeltaCalculator.calculateDelta(currentNoChange, previous);
  console.log('Test 1 (No alert):', d1.isAlertRequired === false ? 'PASS' : 'FAIL');
  console.assert(!d1.isAlertRequired);

  // Test 2: Score increase > 10
  const d2 = DeltaCalculator.calculateDelta(currentBigScoreIncrease, previous);
  console.log('Test 2 (Score delta):', d2.scoreIncreasedSignificantly === true ? 'PASS' : 'FAIL');
  console.assert(d2.isAlertRequired);

  // Test 3: New critical asset
  const d3 = DeltaCalculator.calculateDelta(currentNewCritical, previous);
  console.log('Test 3 (New critical):', d3.hasNewCriticalAssets === true ? 'PASS' : 'FAIL');
  console.assert(d3.isAlertRequired);

  console.log('--- DeltaCalculator Tests Completed ---');
}

testDeltaCalculator();
