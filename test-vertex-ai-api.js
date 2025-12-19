/**
 * Test Next.js API Routes for Vertex AI Video Generation
 * 
 * This script tests the actual API routes to ensure they work with Vertex AI
 */

require('dotenv').config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

console.log('='.repeat(60));
console.log('Next.js API Routes Test - Vertex AI');
console.log('='.repeat(60));
console.log('');

async function testApiRoute(endpoint, method = 'GET', body = null) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`Testing: ${method} ${endpoint}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText.substring(0, 500) };
    }

    console.log(`  Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('  ✅ Success');
      if (responseData.operationId) {
        console.log(`  Operation ID: ${responseData.operationId}`);
      }
      if (responseData.status) {
        console.log(`  Status: ${responseData.status}`);
      }
      if (responseData.message) {
        console.log(`  Message: ${responseData.message}`);
      }
    } else {
      console.log('  ❌ Error');
      console.log(`  Response: ${JSON.stringify(responseData, null, 2).substring(0, 300)}`);
    }
    
    console.log('');
    return { success: response.ok, data: responseData, status: response.status };
  } catch (error) {
    console.log(`  ❌ Network Error: ${error.message}`);
    console.log('');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('1. Testing Video Generation Endpoint');
  console.log('   (This will create a test video generation request)');
  console.log('');
  
  const generateResult = await testApiRoute(
    '/api/gemini/generate-and-save',
    'POST',
    {
      prompt: 'A short test video of a luxury car on a highway',
    }
  );

  if (generateResult.success && generateResult.data.operationId) {
    const operationId = generateResult.data.operationId;
    console.log('2. Testing Polling Endpoint');
    console.log(`   Operation ID: ${operationId}`);
    console.log('');
    
    // Wait a bit before polling
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pollResult = await testApiRoute(
      `/api/gemini/poll-video?operationId=${encodeURIComponent(operationId)}`,
      'GET'
    );

    if (pollResult.success) {
      console.log('3. Testing Hero Video Generation');
      console.log('');
      
      await testApiRoute(
        '/api/gemini/generate-hero-video',
        'POST'
      );
    }
  } else {
    console.log('⚠️  Skipping polling test - no operation ID received');
    console.log('   This may be normal if the endpoint requires different parameters');
  }

  console.log('='.repeat(60));
  console.log('API Routes Test Complete');
  console.log('='.repeat(60));
  console.log('');
  console.log('📝 Next Steps:');
  console.log('   1. Check your Next.js server logs for detailed information');
  console.log('   2. Monitor the terminal where Next.js is running');
  console.log('   3. Look for any authentication or API errors');
  console.log('');
}

// Check if server is running
fetch(`${BASE_URL}/api/gemini/route`, { method: 'GET' })
  .then(() => {
    console.log('✅ Next.js server is running');
    console.log('');
    runTests();
  })
  .catch(() => {
    console.log('❌ Next.js server is not running');
    console.log('   Please start your Next.js development server first:');
    console.log('   npm run dev');
    console.log('');
    console.log('   Then run this test again.');
  });

