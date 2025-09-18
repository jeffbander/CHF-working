const https = require('https');

// Test the voice call API using ngrok
const ngrokUrl = 'https://b545d6dd0331.ngrok.app';

const testData = JSON.stringify({
  patientId: 'test-patient-123',
  phoneNumber: '6465565559',
  patientName: 'Test Patient'
});

const options = {
  hostname: 'b545d6dd0331.ngrok.app',
  port: 443,
  path: '/api/voice-calls',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('Testing voice call API...');
console.log('URL:', ngrokUrl + '/api/voice-calls');
console.log('Test data:', testData);

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:', data);
    try {
      const jsonResponse = JSON.parse(data);
      console.log('Parsed Response:', JSON.stringify(jsonResponse, null, 2));

      if (jsonResponse.success) {
        console.log('✅ Voice call initiated successfully!');
        console.log('Call SID:', jsonResponse.callSid);
      } else {
        console.log('❌ Voice call failed:', jsonResponse.error);
      }
    } catch (e) {
      console.log('Could not parse JSON response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request failed:', error.message);
});

req.write(testData);
req.end();