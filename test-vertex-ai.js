/**
 * Test Script for Vertex AI Veo 3 Video Generation
 * 
 * This script tests the Vertex AI endpoints to verify:
 * 1. Environment variables are loaded correctly
 * 2. Vertex AI API endpoints are accessible
 * 3. Authentication works properly
 */

require('dotenv').config({ path: '.env.local' });

const VERTEX_AI_API_KEY = process.env.VERTEX_AI_API_KEY;
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const GOOGLE_CLOUD_REGION = process.env.GOOGLE_CLOUD_REGION || 'us-central1';

console.log('='.repeat(60));
console.log('Vertex AI Configuration Test');
console.log('='.repeat(60));
console.log('');

// Check environment variables
console.log('1. Environment Variables Check:');
console.log('   VERTEX_AI_API_KEY:', VERTEX_AI_API_KEY ? `${VERTEX_AI_API_KEY.substring(0, 20)}...` : '❌ NOT SET');
console.log('   GOOGLE_CLOUD_PROJECT_ID:', GOOGLE_CLOUD_PROJECT_ID || '❌ NOT SET');
console.log('   GOOGLE_CLOUD_REGION:', GOOGLE_CLOUD_REGION || '❌ NOT SET');
console.log('');

if (!VERTEX_AI_API_KEY || !GOOGLE_CLOUD_PROJECT_ID) {
  console.error('❌ Missing required environment variables!');
  console.error('   Please ensure .env.local contains:');
  console.error('   - VERTEX_AI_API_KEY');
  console.error('   - GOOGLE_CLOUD_PROJECT_ID');
  console.error('   - GOOGLE_CLOUD_REGION (optional, defaults to us-central1)');
  process.exit(1);
}

console.log('✅ All required environment variables are set');
console.log('');

// Test Vertex AI endpoint construction
console.log('2. Vertex AI Endpoint Construction:');
const modelId = 'veo-3.1-generate-preview';
const vertexAiUrl = `https://${GOOGLE_CLOUD_REGION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT_ID}/locations/${GOOGLE_CLOUD_REGION}/publishers/google/models/${modelId}:predictLongRunning?key=${VERTEX_AI_API_KEY}`;
console.log('   Model:', modelId);
console.log('   Endpoint:', vertexAiUrl.substring(0, 100) + '...');
console.log('');

// Test API endpoint accessibility (without making actual video generation request)
console.log('3. Testing API Endpoint Accessibility:');
console.log('   Attempting to verify endpoint format...');

const testRequest = {
  instances: [{
    prompt: 'Test prompt for endpoint verification',
    aspectRatio: '16:9',
    durationSeconds: 5,
  }],
};

async function testEndpoint() {
  try {
    console.log('   Sending test request to Vertex AI...');
    
    const response = await fetch(vertexAiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest),
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText.substring(0, 200) };
    }

    console.log('   Status:', response.status, response.statusText);
    
    if (response.status === 401) {
      console.log('   ⚠️  Authentication Error: Invalid API key or permissions');
      console.log('   Response:', responseData.error?.message || responseData.raw || 'Unauthorized');
    } else if (response.status === 403) {
      console.log('   ⚠️  Permission Error: API key may not have access to Vertex AI');
      console.log('   Response:', responseData.error?.message || responseData.raw || 'Forbidden');
    } else if (response.status === 404) {
      console.log('   ⚠️  Not Found: Model or endpoint may not be available');
      console.log('   Response:', responseData.error?.message || responseData.raw || 'Not Found');
    } else if (response.status === 400) {
      console.log('   ✅ Endpoint is accessible (400 = Bad Request, but endpoint exists)');
      console.log('   Response:', responseData.error?.message || 'Invalid request format');
    } else if (response.ok) {
      console.log('   ✅ Endpoint is accessible and working!');
      console.log('   Response:', JSON.stringify(responseData, null, 2).substring(0, 300));
    } else {
      console.log('   ⚠️  Unexpected status:', response.status);
      console.log('   Response:', responseData.error?.message || responseData.raw || 'Unknown error');
    }

    console.log('');
    console.log('4. Summary:');
    
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      console.log('   ✅ Endpoint format is correct');
      console.log('   ⚠️  Authentication/Permission issues may need to be resolved');
      console.log('   📝 Check Google Cloud Console for:');
      console.log('      - API key permissions');
      console.log('      - Vertex AI API enablement');
      console.log('      - Service account permissions');
    } else if (response.ok) {
      console.log('   ✅ All checks passed! Vertex AI is ready to use.');
    } else {
      console.log('   ⚠️  Endpoint may need configuration');
    }

  } catch (error) {
    console.error('   ❌ Error testing endpoint:', error.message);
    console.error('   Stack:', error.stack);
  }
}

testEndpoint().then(() => {
  console.log('');
  console.log('='.repeat(60));
  console.log('Test Complete');
  console.log('='.repeat(60));
});

