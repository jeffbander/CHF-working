# HeartVoice Monitor - Hybrid AI + Data-TestId Precision Tests

**Version**: 1.0  
**Date**: September 7, 2025  
**Testing Framework**: Stagehand + Playwright Hybrid Approach  

---

## Table of Contents

1. [Hybrid Testing Philosophy](#1-hybrid-testing-philosophy)
2. [Risk Score Calculation Precision Tests](#2-risk-score-calculation-precision-tests)
3. [Clinical Biomarker Validation Tests](#3-clinical-biomarker-validation-tests)
4. [EHR Data Synchronization Tests](#4-ehr-data-synchronization-tests)
5. [Alert Threshold Precision Tests](#5-alert-threshold-precision-tests)
6. [Performance & Clinical SLA Tests](#6-performance--clinical-sla-tests)
7. [Compliance & Audit Trail Tests](#7-compliance--audit-trail-tests)
8. [Data Integrity Validation Tests](#8-data-integrity-validation-tests)

---

## 1. Hybrid Testing Philosophy

### When to Use Hybrid Approach
Hybrid testing combines Stagehand's natural language workflow discovery with Playwright's precise data validation. This approach is essential for HeartVoice Monitor because:

- **Clinical Accuracy**: Voice biomarker calculations must be validated to exact specifications
- **Regulatory Compliance**: HIPAA audit trails require precise timestamp and user tracking
- **Risk Score Precision**: Patient safety depends on accurate risk threshold calculations
- **Performance SLAs**: Clinical response time requirements need millisecond-level validation

### Hybrid Test Pattern
```typescript
// Pattern: Stagehand for discovery → Playwright for validation
await stagePage.act("Navigate to patient with highest risk score");
await stagePage.observe("identify current biomarker readings");

// Precise validation with data-testid
const riskScore = await page.locator('[data-testid="patient-risk-score"]').textContent();
expect(parseInt(riskScore)).toBeGreaterThan(80);
```

---

## 2. Risk Score Calculation Precision Tests

### Test Suite: Voice Biomarker Algorithm Validation

#### Test: Jitter Calculation Accuracy with Clinical Thresholds
```typescript
test('Validate jitter calculation meets clinical accuracy requirements', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    verbose: 1,
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  // Navigate using Stagehand natural language
  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Dr. Sarah Chen");
  await stagePage.act("Find patient Martinez Juan with recent voice assessment");
  await stagePage.act("Open detailed biomarker analysis for latest call");

  // Precise biomarker validation with Playwright
  const jitterValue = await page.locator('[data-testid="biomarker-jitter-value"]').textContent();
  const jitterPercentage = parseFloat(jitterValue.replace('%', ''));
  
  // Clinical validation: Normal jitter < 1.04%, pathological > 2.5%
  expect(jitterPercentage).toBeGreaterThan(0);
  expect(jitterPercentage).toBeLessThan(10); // Sanity check upper bound
  
  const jitterRiskLevel = await page.locator('[data-testid="jitter-risk-classification"]').textContent();
  if (jitterPercentage > 2.5) {
    expect(jitterRiskLevel).toContain('High Risk');
  } else if (jitterPercentage > 1.04) {
    expect(jitterRiskLevel).toContain('Moderate Risk');
  } else {
    expect(jitterRiskLevel).toContain('Normal');
  }

  // Validate confidence interval
  const confidenceInterval = await page.locator('[data-testid="jitter-confidence"]').textContent();
  const confidence = parseFloat(confidenceInterval.replace('%', ''));
  expect(confidence).toBeGreaterThanOrEqual(85); // Minimum clinical confidence requirement

  // Verify calculation timestamp and freshness
  const calculationTimestamp = await page.locator('[data-testid="biomarker-timestamp"]').textContent();
  const timestampDate = new Date(calculationTimestamp);
  const now = new Date();
  const timeDifference = now.getTime() - timestampDate.getTime();
  expect(timeDifference).toBeLessThan(24 * 60 * 60 * 1000); // Within 24 hours

  await stagehand.close();
});
```

#### Test: Composite Risk Score Algorithm Precision
```typescript
test('Validate composite risk score calculation with weighted biomarkers', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  // Stagehand workflow navigation
  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Dr. Sarah Chen");
  await stagePage.act("Access patient Thompson Katie with critical risk score");
  await stagePage.act("Review detailed risk calculation breakdown");

  // Precise risk score component validation
  const overallRiskScore = await page.locator('[data-testid="overall-risk-score"]').textContent();
  const riskValue = parseInt(overallRiskScore);
  expect(riskValue).toBeGreaterThanOrEqual(0);
  expect(riskValue).toBeLessThanOrEqual(100);

  // Individual biomarker components
  const jitterComponent = await page.locator('[data-testid="jitter-risk-component"]').textContent();
  const shimmerComponent = await page.locator('[data-testid="shimmer-risk-component"]').textContent();
  const hnrComponent = await page.locator('[data-testid="hnr-risk-component"]').textContent();
  const f0Component = await page.locator('[data-testid="f0-risk-component"]').textContent();

  // Validate component scoring (0-25 points each for 4 components)
  expect(parseInt(jitterComponent)).toBeLessThanOrEqual(25);
  expect(parseInt(shimmerComponent)).toBeLessThanOrEqual(25);
  expect(parseInt(hnrComponent)).toBeLessThanOrEqual(25);
  expect(parseInt(f0Component)).toBeLessThanOrEqual(25);

  // Verify risk category classification
  const riskCategory = await page.locator('[data-testid="risk-category"]').textContent();
  if (riskValue >= 81) {
    expect(riskCategory).toBe('Critical');
  } else if (riskValue >= 61) {
    expect(riskCategory).toBe('High');
  } else if (riskValue >= 31) {
    expect(riskCategory).toBe('Medium');
  } else {
    expect(riskCategory).toBe('Low');
  }

  // Algorithm version tracking for regulatory compliance
  const algorithmVersion = await page.locator('[data-testid="algorithm-version"]').textContent();
  expect(algorithmVersion).toMatch(/^v\d+\.\d+\.\d+$/); // Semantic versioning format

  await stagehand.close();
});
```

### Test Suite: Risk Score Trending Validation

#### Test: Trend Calculation Mathematical Accuracy
```typescript
test('Validate risk score trending algorithms and slope calculations', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  // Navigate to trending analysis
  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Dr. Sarah Chen");
  await stagePage.act("Open patient Wilson Robert with 7-day risk score history");
  await stagePage.act("View trend analysis and slope calculation details");

  // Precise trend data validation
  const trendSlope = await page.locator('[data-testid="trend-slope-value"]').textContent();
  const slope = parseFloat(trendSlope);
  
  // Validate slope calculation bounds (risk score change per day)
  expect(Math.abs(slope)).toBeLessThanOrEqual(14.3); // Maximum possible daily change (100 points / 7 days)
  
  const trendDirection = await page.locator('[data-testid="trend-direction"]').textContent();
  if (slope > 2.0) {
    expect(trendDirection).toContain('Rapidly Increasing');
  } else if (slope > 0.5) {
    expect(trendDirection).toContain('Increasing');
  } else if (slope < -2.0) {
    expect(trendDirection).toContain('Rapidly Decreasing');
  } else if (slope < -0.5) {
    expect(trendDirection).toContain('Decreasing');
  } else {
    expect(trendDirection).toContain('Stable');
  }

  // Validate R-squared correlation coefficient
  const correlation = await page.locator('[data-testid="trend-correlation"]').textContent();
  const rSquared = parseFloat(correlation);
  expect(rSquared).toBeGreaterThanOrEqual(0);
  expect(rSquared).toBeLessThanOrEqual(1);

  // Clinical significance threshold validation
  const clinicalSignificance = await page.locator('[data-testid="clinical-significance"]').textContent();
  if (Math.abs(slope) > 2.0 && rSquared > 0.7) {
    expect(clinicalSignificance).toBe('Clinically Significant');
  } else {
    expect(clinicalSignificance).toBe('Not Clinically Significant');
  }

  await stagehand.close();
});
```

---

## 3. Clinical Biomarker Validation Tests

### Test Suite: Voice Quality Metrics Precision

#### Test: Shimmer Calculation Clinical Standards Compliance
```typescript
test('Validate shimmer calculation meets clinical research standards', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  // Stagehand navigation to biomarker analysis
  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Dr. Sarah Chen");
  await stagePage.act("Review patient Davis Maria with voice quality concerns");
  await stagePage.act("Access detailed shimmer analysis from latest assessment");

  // Precise shimmer validation
  const shimmerValue = await page.locator('[data-testid="biomarker-shimmer-value"]').textContent();
  const shimmerDb = parseFloat(shimmerValue.replace('dB', ''));
  
  // Clinical standards: Normal shimmer < 0.35 dB, pathological > 1.0 dB
  expect(shimmerDb).toBeGreaterThan(0);
  expect(shimmerDb).toBeLessThan(5); // Sanity check upper bound
  
  // Validate shimmer calculation method
  const calculationMethod = await page.locator('[data-testid="shimmer-method"]').textContent();
  expect(calculationMethod).toContain('Local Shimmer (dB)'); // Standard clinical method
  
  // Verify window size and overlap parameters
  const windowSize = await page.locator('[data-testid="shimmer-window-size"]').textContent();
  expect(windowSize).toContain('20ms'); // Standard for voice analysis
  
  const overlapPercent = await page.locator('[data-testid="shimmer-overlap"]').textContent();
  expect(overlapPercent).toContain('50%'); // Industry standard overlap

  // Clinical interpretation accuracy
  const shimmerInterpretation = await page.locator('[data-testid="shimmer-interpretation"]').textContent();
  if (shimmerDb > 1.0) {
    expect(shimmerInterpretation).toContain('Pathological');
  } else if (shimmerDb > 0.35) {
    expect(shimmerInterpretation).toContain('Borderline');
  } else {
    expect(shimmerInterpretation).toContain('Normal');
  }

  await stagehand.close();
});
```

#### Test: Harmonics-to-Noise Ratio (HNR) Precision Validation
```typescript
test('Validate HNR calculation precision for clinical decision support', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  // Navigate using natural language
  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Dr. Sarah Chen");
  await stagePage.act("Find patient Johnson Alice with recent voice analysis");
  await stagePage.act("Open HNR biomarker details and calculation parameters");

  // Precise HNR value validation
  const hnrValue = await page.locator('[data-testid="biomarker-hnr-value"]').textContent();
  const hnrDb = parseFloat(hnrValue.replace('dB', ''));
  
  // Clinical bounds: Healthy HNR > 12 dB, pathological < 8 dB
  expect(hnrDb).toBeGreaterThan(-5); // Lower technical bound
  expect(hnrDb).toBeLessThan(30); // Upper technical bound
  
  // Validate frequency range analysis
  const frequencyRange = await page.locator('[data-testid="hnr-frequency-range"]').textContent();
  expect(frequencyRange).toContain('80-500 Hz'); // Standard voice fundamental frequency range
  
  // Verify autocorrelation method
  const hnrMethod = await page.locator('[data-testid="hnr-calculation-method"]').textContent();
  expect(hnrMethod).toContain('Autocorrelation'); // Gold standard method
  
  // Clinical classification validation
  const hnrClassification = await page.locator('[data-testid="hnr-classification"]').textContent();
  if (hnrDb > 12) {
    expect(hnrClassification).toContain('Normal');
  } else if (hnrDb > 8) {
    expect(hnrClassification).toContain('Mild Impairment');
  } else if (hnrDb > 4) {
    expect(hnrClassification).toContain('Moderate Impairment');
  } else {
    expect(hnrClassification).toContain('Severe Impairment');
  }

  // Quality control validation
  const signalQuality = await page.locator('[data-testid="hnr-signal-quality"]').textContent();
  expect(signalQuality).toMatch(/^(Excellent|Good|Fair|Poor)$/);
  
  const minimumSNR = await page.locator('[data-testid="minimum-snr"]').textContent();
  const snrValue = parseFloat(minimumSNR.replace('dB', ''));
  expect(snrValue).toBeGreaterThanOrEqual(15); // Minimum for reliable HNR calculation

  await stagehand.close();
});
```

### Test Suite: Fundamental Frequency (F0) Analysis

#### Test: F0 Variability and Clinical Correlation
```typescript
test('Validate F0 analysis precision for respiratory status correlation', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  // Navigate to F0 analysis
  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Dr. Sarah Chen");
  await stagePage.act("Access patient Brown Michael with respiratory concerns");
  await stagePage.act("Review fundamental frequency analysis and variability metrics");

  // Precise F0 measurement validation
  const meanF0 = await page.locator('[data-testid="f0-mean-value"]').textContent();
  const f0Mean = parseFloat(meanF0.replace('Hz', ''));
  
  // Validate F0 range for adult speakers
  expect(f0Mean).toBeGreaterThan(75); // Lower bound for adult males
  expect(f0Mean).toBeLessThan(350); // Upper bound for adult females
  
  // F0 standard deviation (variability indicator)
  const f0StdDev = await page.locator('[data-testid="f0-standard-deviation"]').textContent();
  const stdDev = parseFloat(f0StdDev.replace('Hz', ''));
  expect(stdDev).toBeGreaterThan(0);
  expect(stdDev).toBeLessThan(50); // Sanity check for excessive variability

  // Coefficient of variation validation
  const f0CoV = await page.locator('[data-testid="f0-coefficient-variation"]').textContent();
  const coefficientVariation = parseFloat(f0CoV.replace('%', ''));
  expect(coefficientVariation).toBeGreaterThan(0);
  expect(coefficientVariation).toBeLessThan(50); // Upper bound for clinical significance

  // Gender-specific validation
  const patientGender = await page.locator('[data-testid="patient-gender"]').textContent();
  if (patientGender === 'Male') {
    expect(f0Mean).toBeGreaterThan(75);
    expect(f0Mean).toBeLessThan(200);
  } else if (patientGender === 'Female') {
    expect(f0Mean).toBeGreaterThan(150);
    expect(f0Mean).toBeLessThan(300);
  }

  // Clinical correlation with respiratory status
  const respiratoryCorrelation = await page.locator('[data-testid="f0-respiratory-correlation"]').textContent();
  const correlation = parseFloat(respiratoryCorrelation);
  expect(Math.abs(correlation)).toBeLessThanOrEqual(1); // Valid correlation coefficient

  // F0 tracking accuracy validation
  const trackingAccuracy = await page.locator('[data-testid="f0-tracking-accuracy"]').textContent();
  const accuracy = parseFloat(trackingAccuracy.replace('%', ''));
  expect(accuracy).toBeGreaterThanOrEqual(85); // Minimum clinical requirement

  await stagehand.close();
});
```

---

## 4. EHR Data Synchronization Tests

### Test Suite: Epic Integration Data Precision

#### Test: Patient Demographics Synchronization Accuracy
```typescript
test('Validate precise patient data sync between HeartVoice and Epic', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  // Navigate to EHR sync interface
  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Dr. Sarah Chen");
  await stagePage.act("Access EHR synchronization status for patient Martinez Juan");
  await stagePage.act("Review latest sync results and data consistency checks");

  // Precise demographic data validation
  const patientMRN = await page.locator('[data-testid="patient-mrn"]').textContent();
  expect(patientMRN).toMatch(/^\d{7,10}$/); // Standard MRN format
  
  const patientDOB = await page.locator('[data-testid="patient-dob"]').textContent();
  const dobDate = new Date(patientDOB);
  expect(dobDate).toBeInstanceOf(Date);
  expect(dobDate.getTime()).toBeLessThan(new Date().getTime()); // DOB must be in past

  const epicSyncStatus = await page.locator('[data-testid="epic-sync-status"]').textContent();
  expect(epicSyncStatus).toBe('Synchronized');
  
  // Sync timestamp validation
  const lastSyncTime = await page.locator('[data-testid="last-sync-timestamp"]').textContent();
  const syncDate = new Date(lastSyncTime);
  const timeSinceSync = new Date().getTime() - syncDate.getTime();
  expect(timeSinceSync).toBeLessThan(15 * 60 * 1000); // Within 15 minutes

  // Data integrity checks
  const dataIntegrityScore = await page.locator('[data-testid="data-integrity-score"]').textContent();
  const integrityPercentage = parseFloat(dataIntegrityScore.replace('%', ''));
  expect(integrityPercentage).toBeGreaterThanOrEqual(99.5); // High precision requirement

  // Field-level sync validation
  const syncedFields = await page.locator('[data-testid="synced-fields-count"]').textContent();
  const fieldCount = parseInt(syncedFields);
  expect(fieldCount).toBeGreaterThan(15); // Minimum required patient data fields

  const failedFields = await page.locator('[data-testid="sync-failed-fields"]').textContent();
  expect(failedFields).toBe('0'); // Zero tolerance for sync failures

  await stagehand.close();
});
```

#### Test: Clinical Data Bidirectional Sync Precision
```typescript
test('Validate bidirectional clinical data sync with timestamp precision', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  // Test voice data export to Epic
  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Dr. Sarah Chen");
  await stagePage.act("Complete voice assessment for patient Wilson Robert");
  await stagePage.act("Export risk score and biomarkers to Epic encounter");

  // Validate export precision
  const exportStatus = await page.locator('[data-testid="epic-export-status"]').textContent();
  expect(exportStatus).toBe('Successfully Exported');
  
  const exportTimestamp = await page.locator('[data-testid="export-timestamp"]').textContent();
  const exportDate = new Date(exportTimestamp);
  const exportDelay = new Date().getTime() - exportDate.getTime();
  expect(exportDelay).toBeLessThan(30 * 1000); // Export within 30 seconds

  // FHIR data format validation
  const fhirFormat = await page.locator('[data-testid="fhir-format-valid"]').textContent();
  expect(fhirFormat).toBe('Valid FHIR R4');
  
  const observationCode = await page.locator('[data-testid="fhir-observation-code"]').textContent();
  expect(observationCode).toContain('LOINC'); // Standard clinical coding
  
  // Clinical note integration validation
  const clinicalNote = await page.locator('[data-testid="epic-clinical-note"]').textContent();
  expect(clinicalNote).toContain('HeartVoice Monitor Assessment');
  expect(clinicalNote).toMatch(/Risk Score: \d{1,3}/); // Risk score included
  
  // Encounter linkage precision
  const encounterID = await page.locator('[data-testid="epic-encounter-id"]').textContent();
  expect(encounterID).toMatch(/^\d+$/); // Numeric encounter ID
  
  const encounterStatus = await page.locator('[data-testid="encounter-link-status"]').textContent();
  expect(encounterStatus).toBe('Linked Successfully');

  await stagehand.close();
});
```

### Test Suite: Cerner SMART on FHIR Precision

#### Test: SMART Launch Context Validation
```typescript
test('Validate SMART on FHIR context precision and security', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  // Simulate SMART launch from Cerner
  const smartLaunchURL = "http://localhost:3000/smart-launch";
  const patientContext = "12345";
  const practitionerContext = "67890";
  
  await stagePage.goto(`${smartLaunchURL}?patient=${patientContext}&practitioner=${practitionerContext}`);
  await stagePage.act("Complete SMART on FHIR authentication flow");

  // Validate SMART context precision
  const patientID = await page.locator('[data-testid="smart-patient-id"]').textContent();
  expect(patientID).toBe(patientContext);
  
  const practitionerID = await page.locator('[data-testid="smart-practitioner-id"]').textContent();
  expect(practitionerID).toBe(practitionerContext);

  // OAuth token validation
  const accessTokenStatus = await page.locator('[data-testid="oauth-token-status"]').textContent();
  expect(accessTokenStatus).toBe('Valid');
  
  const tokenExpiry = await page.locator('[data-testid="token-expiry-time"]').textContent();
  const expiryDate = new Date(tokenExpiry);
  expect(expiryDate.getTime()).toBeGreaterThan(new Date().getTime()); // Token not expired

  // SMART scopes validation
  const authorizedScopes = await page.locator('[data-testid="smart-scopes"]').textContent();
  expect(authorizedScopes).toContain('patient/Observation.read');
  expect(authorizedScopes).toContain('patient/Patient.read');
  
  // FHIR endpoint validation
  const fhirEndpoint = await page.locator('[data-testid="fhir-endpoint-url"]').textContent();
  expect(fhirEndpoint).toMatch(/^https?:\/\/.+\/fhir$/i);
  
  const endpointStatus = await page.locator('[data-testid="fhir-endpoint-status"]').textContent();
  expect(endpointStatus).toBe('Connected');

  // Context security validation
  const sessionSecurity = await page.locator('[data-testid="session-security-level"]').textContent();
  expect(sessionSecurity).toBe('HTTPS Encrypted');
  
  const csrfToken = await page.locator('[data-testid="csrf-token-present"]').textContent();
  expect(csrfToken).toBe('Present');

  await stagehand.close();
});
```

---

## 5. Alert Threshold Precision Tests

### Test Suite: Clinical Alert Threshold Validation

#### Test: Risk Score Alert Threshold Mathematical Precision
```typescript
test('Validate alert thresholds trigger at precise clinical values', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  // Navigate to alert threshold configuration
  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Dr. Sarah Chen");
  await stagePage.act("Access alert threshold configuration for patient Martinez Juan");
  await stagePage.act("Review current threshold settings and test alert triggers");

  // Validate critical alert threshold (≥85)
  const criticalThreshold = await page.locator('[data-testid="critical-alert-threshold"]').textContent();
  expect(parseInt(criticalThreshold)).toBe(85);
  
  // Test threshold boundary conditions
  await stagePage.act("Simulate patient risk score of exactly 85");
  
  const alertTriggered = await page.locator('[data-testid="critical-alert-triggered"]').textContent();
  expect(alertTriggered).toBe('Yes');
  
  const alertTimestamp = await page.locator('[data-testid="alert-trigger-timestamp"]').textContent();
  const triggerTime = new Date(alertTimestamp);
  const timeSinceTrigger = new Date().getTime() - triggerTime.getTime();
  expect(timeSinceTrigger).toBeLessThan(5000); // Alert within 5 seconds

  // Test threshold precision at boundary
  await stagePage.act("Simulate patient risk score of exactly 84.9");
  
  const belowThresholdAlert = await page.locator('[data-testid="critical-alert-triggered"]').textContent();
  expect(belowThresholdAlert).toBe('No');

  // Validate high-risk alert threshold (≥70)
  const highRiskThreshold = await page.locator('[data-testid="high-risk-threshold"]').textContent();
  expect(parseInt(highRiskThreshold)).toBe(70);
  
  await stagePage.act("Simulate patient risk score of exactly 70");
  
  const highRiskAlert = await page.locator('[data-testid="high-risk-alert-triggered"]').textContent();
  expect(highRiskAlert).toBe('Yes');
  
  const highRiskAlertLevel = await page.locator('[data-testid="alert-severity-level"]').textContent();
  expect(highRiskAlertLevel).toBe('High Risk');

  // Validate escalation timing precision
  const escalationDelay = await page.locator('[data-testid="escalation-delay-minutes"]').textContent();
  expect(parseInt(escalationDelay)).toBe(15); // 15-minute escalation window
  
  const escalationStatus = await page.locator('[data-testid="escalation-timer-active"]').textContent();
  expect(escalationStatus).toBe('Active');

  await stagehand.close();
});
```

#### Test: Biomarker Change Rate Alert Precision
```typescript
test('Validate biomarker change rate alerts with mathematical precision', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  // Navigate to change rate alert testing
  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Dr. Sarah Chen");
  await stagePage.act("Access patient Thompson Katie with rapid biomarker changes");
  await stagePage.act("Review change rate calculations and alert thresholds");

  // Validate jitter change rate threshold
  const jitterChangeRate = await page.locator('[data-testid="jitter-change-rate"]').textContent();
  const changeRate = parseFloat(jitterChangeRate.replace('%/day', ''));
  
  const jitterChangeThreshold = await page.locator('[data-testid="jitter-change-threshold"]').textContent();
  const threshold = parseFloat(jitterChangeThreshold.replace('%/day', ''));
  expect(threshold).toBe(0.5); // 0.5% per day threshold
  
  // Test change rate alert trigger
  if (changeRate > threshold) {
    const changeRateAlert = await page.locator('[data-testid="jitter-change-alert"]').textContent();
    expect(changeRateAlert).toBe('Triggered');
    
    const alertMessage = await page.locator('[data-testid="change-rate-alert-message"]').textContent();
    expect(alertMessage).toContain('Rapid jitter increase detected');
  }

  // Validate trend significance calculation
  const trendSignificance = await page.locator('[data-testid="trend-significance-p-value"]').textContent();
  const pValue = parseFloat(trendSignificance.replace('p=', ''));
  expect(pValue).toBeGreaterThan(0);
  expect(pValue).toBeLessThanOrEqual(1);
  
  const statisticalSignificance = await page.locator('[data-testid="statistically-significant"]').textContent();
  if (pValue < 0.05) {
    expect(statisticalSignificance).toBe('Yes');
  } else {
    expect(statisticalSignificance).toBe('No');
  }

  // Validate confidence interval for change rate
  const changeRateCI = await page.locator('[data-testid="change-rate-confidence-interval"]').textContent();
  expect(changeRateCI).toMatch(/^\[[\d\.\-]+, [\d\.\-]+\]$/); // [lower, upper] format
  
  const ciWidth = await page.locator('[data-testid="ci-width"]').textContent();
  const intervalWidth = parseFloat(ciWidth);
  expect(intervalWidth).toBeLessThan(2.0); // Reasonable precision for clinical use

  await stagehand.close();
});
```

---

## 6. Performance & Clinical SLA Tests

### Test Suite: Response Time Precision Validation

#### Test: Dashboard Load Time Clinical Requirements
```typescript
test('Validate dashboard meets <2 second clinical response requirement', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  // Measure precise load times
  const navigationStart = performance.now();
  
  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Dr. Sarah Chen with clinical credentials");
  
  // Wait for dashboard to fully load
  await page.waitForSelector('[data-testid="dashboard-fully-loaded"]', { timeout: 5000 });
  
  const loadComplete = performance.now();
  const totalLoadTime = loadComplete - navigationStart;
  
  // Clinical SLA requirement: <2 seconds
  expect(totalLoadTime).toBeLessThan(2000);
  
  // Validate individual component load times
  const criticalAlertsLoadTime = await page.locator('[data-testid="critical-alerts-load-time"]').textContent();
  const alertsLoadMs = parseInt(criticalAlertsLoadTime.replace('ms', ''));
  expect(alertsLoadMs).toBeLessThan(500); // Critical components load in <500ms
  
  const patientListLoadTime = await page.locator('[data-testid="patient-list-load-time"]').textContent();
  const patientLoadMs = parseInt(patientListLoadTime.replace('ms', ''));
  expect(patientLoadMs).toBeLessThan(1000); // Patient list loads in <1s
  
  const riskScoresLoadTime = await page.locator('[data-testid="risk-scores-load-time"]').textContent();
  const riskLoadMs = parseInt(riskScoresLoadTime.replace('ms', ''));
  expect(riskLoadMs).toBeLessThan(800); // Risk scores load in <800ms

  // Validate Time to Interactive (TTI)
  const timeToInteractive = await page.locator('[data-testid="time-to-interactive"]').textContent();
  const ttiMs = parseInt(timeToInteractive.replace('ms', ''));
  expect(ttiMs).toBeLessThan(1500); // Interactive within 1.5 seconds

  await stagehand.close();
});
```

#### Test: API Response Time SLA Validation
```typescript
test('Validate API endpoints meet clinical response time requirements', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Dr. Sarah Chen");
  
  // Test critical API endpoints
  const apiTests = [
    { endpoint: 'patient-list', maxTime: 500, testId: 'patient-list-api-time' },
    { endpoint: 'risk-scores', maxTime: 300, testId: 'risk-scores-api-time' },
    { endpoint: 'critical-alerts', maxTime: 200, testId: 'critical-alerts-api-time' },
    { endpoint: 'biomarker-data', maxTime: 400, testId: 'biomarker-api-time' }
  ];

  for (const test of apiTests) {
    await stagePage.act(`Trigger API call for ${test.endpoint}`);
    
    const responseTime = await page.locator(`[data-testid="${test.testId}"]`).textContent();
    const responseMs = parseInt(responseTime.replace('ms', ''));
    
    expect(responseMs).toBeLessThan(test.maxTime);
    
    // Validate response completeness
    const responseComplete = await page.locator(`[data-testid="${test.endpoint}-complete"]`).textContent();
    expect(responseComplete).toBe('true');
  }

  // Database query performance validation
  const dbQueryTime = await page.locator('[data-testid="db-query-avg-time"]').textContent();
  const avgQueryMs = parseInt(dbQueryTime.replace('ms', ''));
  expect(avgQueryMs).toBeLessThan(100); // Database queries <100ms average

  // Cache hit rate validation
  const cacheHitRate = await page.locator('[data-testid="cache-hit-rate"]').textContent();
  const hitRate = parseFloat(cacheHitRate.replace('%', ''));
  expect(hitRate).toBeGreaterThan(85); // >85% cache hit rate for performance

  await stagehand.close();
});
```

### Test Suite: Concurrent User Load Testing

#### Test: Multi-User Performance Precision
```typescript
test('Validate performance under concurrent clinical user load', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Simulate 50 concurrent cardiologists accessing dashboard");
  
  // Monitor system performance under load
  const concurrentUsers = await page.locator('[data-testid="concurrent-users-count"]').textContent();
  expect(parseInt(concurrentUsers)).toBeGreaterThanOrEqual(50);
  
  const systemResponseTime = await page.locator('[data-testid="system-response-time-p95"]').textContent();
  const p95ResponseMs = parseInt(systemResponseTime.replace('ms', ''));
  expect(p95ResponseMs).toBeLessThan(3000); // 95th percentile <3s under load
  
  // Database connection pool validation
  const dbConnectionsActive = await page.locator('[data-testid="db-connections-active"]').textContent();
  const activeConnections = parseInt(dbConnectionsActive);
  expect(activeConnections).toBeLessThan(100); // Efficient connection usage
  
  const dbConnectionsAvailable = await page.locator('[data-testid="db-connections-available"]').textContent();
  const availableConnections = parseInt(dbConnectionsAvailable);
  expect(availableConnections).toBeGreaterThan(20); // Sufficient connection headroom

  // Memory usage under load
  const memoryUsage = await page.locator('[data-testid="memory-usage-percent"]').textContent();
  const memUsagePercent = parseInt(memoryUsage.replace('%', ''));
  expect(memUsagePercent).toBeLessThan(80); // Memory usage <80% under load

  // Error rate validation under load
  const errorRate = await page.locator('[data-testid="error-rate-percent"]').textContent();
  const errorRatePercent = parseFloat(errorRate.replace('%', ''));
  expect(errorRatePercent).toBeLessThan(0.1); // <0.1% error rate under load

  await stagehand.close();
});
```

---

## 7. Compliance & Audit Trail Tests

### Test Suite: HIPAA Audit Trail Precision

#### Test: Complete Audit Trail Validation
```typescript
test('Validate comprehensive HIPAA audit trail with precise timestamps', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  // Perform auditable clinical actions
  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Dr. Sarah Chen");
  const loginTime = new Date();
  
  await stagePage.act("Access patient Martinez Juan medical record");
  await stagePage.act("View voice assessment biomarker data");
  await stagePage.act("Update clinical notes with assessment findings");
  await stagePage.act("Export data to Epic EHR system");

  // Validate audit trail completeness
  const auditEntryCount = await page.locator('[data-testid="audit-entries-count"]').textContent();
  expect(parseInt(auditEntryCount)).toBeGreaterThanOrEqual(4); // All actions logged
  
  // Login audit validation
  const loginAuditEntry = await page.locator('[data-testid="audit-login-entry"]').textContent();
  expect(loginAuditEntry).toContain('Dr. Sarah Chen');
  expect(loginAuditEntry).toContain('LOGIN');
  
  const loginTimestamp = await page.locator('[data-testid="login-audit-timestamp"]').textContent();
  const auditLoginTime = new Date(loginTimestamp);
  const timeDiff = Math.abs(auditLoginTime.getTime() - loginTime.getTime());
  expect(timeDiff).toBeLessThan(5000); // Timestamp within 5 seconds

  // Patient access audit validation
  const patientAccessAudit = await page.locator('[data-testid="patient-access-audit"]').textContent();
  expect(patientAccessAudit).toContain('Martinez, Juan');
  expect(patientAccessAudit).toContain('PATIENT_ACCESS');
  
  const accessPurpose = await page.locator('[data-testid="access-purpose"]').textContent();
  expect(accessPurpose).toBe('TREATMENT'); // Valid HIPAA purpose
  
  // Data export audit validation
  const exportAudit = await page.locator('[data-testid="data-export-audit"]').textContent();
  expect(exportAudit).toContain('EPIC_EXPORT');
  expect(exportAudit).toContain('FHIR_OBSERVATION');
  
  // Audit trail integrity validation
  const auditHashValidation = await page.locator('[data-testid="audit-trail-hash-valid"]').textContent();
  expect(auditHashValidation).toBe('Valid'); // Tamper-proof validation
  
  const auditEncryption = await page.locator('[data-testid="audit-encryption-status"]').textContent();
  expect(auditEncryption).toBe('AES-256 Encrypted'); // Audit trail encrypted

  await stagehand.close();
});
```

#### Test: User Session Security Validation
```typescript
test('Validate user session security and timeout precision', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Dr. Sarah Chen");
  
  // Validate session security parameters
  const sessionToken = await page.locator('[data-testid="session-token-present"]').textContent();
  expect(sessionToken).toBe('Present');
  
  const tokenEncryption = await page.locator('[data-testid="session-token-encryption"]').textContent();
  expect(tokenEncryption).toBe('JWT Encrypted');
  
  // Session timeout validation
  const sessionTimeout = await page.locator('[data-testid="session-timeout-minutes"]').textContent();
  expect(parseInt(sessionTimeout)).toBe(30); // 30-minute timeout for clinical users
  
  const timeoutWarning = await page.locator('[data-testid="timeout-warning-minutes"]').textContent();
  expect(parseInt(timeoutWarning)).toBe(25); // 5-minute warning before timeout
  
  // Multi-factor authentication validation
  const mfaStatus = await page.locator('[data-testid="mfa-verification-status"]').textContent();
  expect(mfaStatus).toBe('Verified');
  
  const mfaMethod = await page.locator('[data-testid="mfa-method-used"]').textContent();
  expect(mfaMethod).toMatch(/^(TOTP|SMS|PUSH_NOTIFICATION)$/);

  // IP address and geolocation validation
  const userIPAddress = await page.locator('[data-testid="user-ip-address"]').textContent();
  expect(userIPAddress).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/); // Valid IP format
  
  const geoLocationValid = await page.locator('[data-testid="geo-location-valid"]').textContent();
  expect(geoLocationValid).toBe('Authorized Location');

  // Device fingerprinting validation
  const deviceFingerprint = await page.locator('[data-testid="device-fingerprint"]').textContent();
  expect(deviceFingerprint).toMatch(/^[A-Fa-f0-9]{32}$/); // 32-character hex string
  
  const deviceTrusted = await page.locator('[data-testid="device-trusted-status"]').textContent();
  expect(deviceTrusted).toBe('Trusted Device');

  await stagehand.close();
});
```

---

## 8. Data Integrity Validation Tests

### Test Suite: Database Transaction Integrity

#### Test: Clinical Data Transaction Atomicity
```typescript
test('Validate database transaction integrity for clinical data updates', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Dr. Sarah Chen");
  
  // Initiate complex clinical data update
  await stagePage.act("Update patient Wilson Robert with new assessment data");
  await stagePage.act("Simultaneously update risk score, biomarkers, and clinical notes");
  
  // Validate transaction atomicity
  const transactionStatus = await page.locator('[data-testid="transaction-status"]').textContent();
  expect(transactionStatus).toBe('COMMITTED');
  
  const transactionID = await page.locator('[data-testid="transaction-id"]').textContent();
  expect(transactionID).toMatch(/^TX_[A-Fa-f0-9]{16}$/); // Valid transaction ID format
  
  // Validate all related data updated consistently
  const riskScoreUpdated = await page.locator('[data-testid="risk-score-updated"]').textContent();
  expect(riskScoreUpdated).toBe('true');
  
  const biomarkersUpdated = await page.locator('[data-testid="biomarkers-updated"]').textContent();
  expect(biomarkersUpdated).toBe('true');
  
  const clinicalNotesUpdated = await page.locator('[data-testid="clinical-notes-updated"]').textContent();
  expect(clinicalNotesUpdated).toBe('true');
  
  // Validate update timestamps are identical (atomic update)
  const riskScoreTimestamp = await page.locator('[data-testid="risk-score-timestamp"]').textContent();
  const biomarkerTimestamp = await page.locator('[data-testid="biomarker-timestamp"]').textContent();
  const notesTimestamp = await page.locator('[data-testid="notes-timestamp"]').textContent();
  
  expect(riskScoreTimestamp).toBe(biomarkerTimestamp);
  expect(biomarkerTimestamp).toBe(notesTimestamp);

  // Database consistency validation
  const consistencyCheck = await page.locator('[data-testid="db-consistency-check"]').textContent();
  expect(consistencyCheck).toBe('CONSISTENT');
  
  const foreignKeyConstraints = await page.locator('[data-testid="fk-constraints-valid"]').textContent();
  expect(foreignKeyConstraints).toBe('Valid');

  await stagehand.close();
});
```

#### Test: Voice Data Storage Integrity
```typescript
test('Validate voice recording storage and retrieval precision', async ({ page }) => {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const stagePage = stagehand.page;

  await stagePage.goto("http://localhost:3000");
  await stagePage.act("Log in as Maria Rodriguez, Care Coordinator");
  await stagePage.act("Complete voice assessment for patient Davis Maria");
  
  // Validate voice data storage
  const voiceRecordingStored = await page.locator('[data-testid="voice-recording-stored"]').textContent();
  expect(voiceRecordingStored).toBe('true');
  
  const storageChecksum = await page.locator('[data-testid="voice-file-checksum"]').textContent();
  expect(storageChecksum).toMatch(/^[A-Fa-f0-9]{64}$/); // SHA-256 hash format
  
  const encryptionStatus = await page.locator('[data-testid="voice-file-encrypted"]').textContent();
  expect(encryptionStatus).toBe('AES-256 Encrypted');
  
  // Audio quality validation
  const audioSampleRate = await page.locator('[data-testid="audio-sample-rate"]').textContent();
  expect(audioSampleRate).toBe('16000 Hz'); // Standard for clinical voice analysis
  
  const audioBitDepth = await page.locator('[data-testid="audio-bit-depth"]').textContent();
  expect(audioBitDepth).toBe('16-bit'); // CD quality for biomarker accuracy
  
  const audioDuration = await page.locator('[data-testid="audio-duration-seconds"]').textContent();
  const durationSeconds = parseFloat(audioDuration);
  expect(durationSeconds).toBeGreaterThan(30); // Minimum length for analysis
  expect(durationSeconds).toBeLessThan(600); // Maximum length for practicality

  // Biomarker extraction validation
  const biomarkerExtractionComplete = await page.locator('[data-testid="biomarker-extraction-complete"]').textContent();
  expect(biomarkerExtractionComplete).toBe('true');
  
  const extractionAccuracy = await page.locator('[data-testid="extraction-accuracy-percent"]').textContent();
  const accuracy = parseFloat(extractionAccuracy.replace('%', ''));
  expect(accuracy).toBeGreaterThanOrEqual(95); // Clinical grade accuracy

  // Data retention policy validation
  const retentionPolicy = await page.locator('[data-testid="voice-data-retention-days"]').textContent();
  expect(parseInt(retentionPolicy)).toBe(30); // 30-day retention for clinical data
  
  const autoDeleteScheduled = await page.locator('[data-testid="auto-delete-scheduled"]').textContent();
  expect(autoDeleteScheduled).toBe('true');

  await stagehand.close();
});
```

---

## Test Execution Configuration

### Hybrid Test Setup
```typescript
// Global test configuration for hybrid Stagehand + Playwright
const hybridTestConfig = {
  // Stagehand configuration
  stagehand: {
    env: "LOCAL",
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    verbose: 1,
    timeout: 60000, // Extended timeout for complex clinical workflows
  },
  
  // Playwright configuration for precision validation
  playwright: {
    baseURL: "http://localhost:3000",
    timeout: 30000,
    expect: {
      timeout: 10000, // Extended expect timeout for clinical data loading
    },
    use: {
      headless: false, // Visual validation for clinical accuracy
      viewport: { width: 1920, height: 1080 },
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
    },
  },
};
```

### Data Validation Utilities
```typescript
// Clinical data validation helpers
const clinicalValidators = {
  riskScore: (score: number) => score >= 0 && score <= 100,
  jitter: (jitter: number) => jitter > 0 && jitter < 10,
  shimmer: (shimmer: number) => shimmer > 0 && shimmer < 5,
  hnr: (hnr: number) => hnr > -5 && hnr < 30,
  f0: (f0: number, gender: string) => {
    if (gender === 'Male') return f0 > 75 && f0 < 200;
    if (gender === 'Female') return f0 > 150 && f0 < 300;
    return f0 > 75 && f0 < 300;
  },
};
```

### Success Criteria for Hybrid Tests
- **Clinical Accuracy**: 100% of biomarker calculations within clinical tolerance
- **Performance Precision**: All response time requirements met with <5% variance
- **Data Integrity**: Zero tolerance for data corruption or inconsistency
- **Compliance Validation**: 100% of audit trail and security requirements met
- **Integration Precision**: All EHR sync operations maintain data accuracy
- **Alert Threshold Accuracy**: Mathematical precision at all clinical boundary conditions

This hybrid testing approach ensures HeartVoice Monitor meets the highest standards for clinical accuracy, regulatory compliance, and performance reliability while leveraging both AI-powered workflow testing and precise technical validation.