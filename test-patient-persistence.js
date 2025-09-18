// Simple test script to verify patient persistence
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const patientsFile = path.join(dataDir, 'patients.json');

console.log('Testing patient persistence...');
console.log('Data directory:', dataDir);
console.log('Patients file:', patientsFile);

// Check if data directory exists
if (fs.existsSync(dataDir)) {
  console.log('✅ Data directory exists');
  
  // Check if patients file exists
  if (fs.existsSync(patientsFile)) {
    console.log('✅ Patients file exists');
    
    try {
      const data = fs.readFileSync(patientsFile, 'utf8');
      const patients = JSON.parse(data);
      console.log(`✅ Found ${patients.length} patients in storage`);
      
      // Show first patient as sample
      if (patients.length > 0) {
        const firstPatient = patients[0];
        console.log('Sample patient:', {
          id: firstPatient.id,
          name: `${firstPatient.demographics.firstName} ${firstPatient.demographics.lastName}`,
          riskLevel: firstPatient.currentRisk.level
        });
      }
    } catch (error) {
      console.log('❌ Error reading patients file:', error.message);
    }
  } else {
    console.log('⚠️ Patients file does not exist yet');
  }
} else {
  console.log('⚠️ Data directory does not exist yet');
}

console.log('\nTo test persistence:');
console.log('1. Start the dev server: npm run dev');
console.log('2. Go to http://localhost:3000');
console.log('3. Add a new patient');
console.log('4. Run this script again to see if data persists');
console.log('5. Restart the server and check if the patient is still there');