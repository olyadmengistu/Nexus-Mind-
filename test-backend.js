// Backend Testing Script for NexusMind
// Run this with: node test-backend.js

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, endpoint, data = null, headers = {}) {
  try {
    log(`\n🧪 Testing: ${name}`, 'blue');
    log(`   ${method} ${endpoint}`, 'yellow');

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();

    if (response.ok) {
      log(`   ✅ SUCCESS (${response.status})`, 'green');
      log(`   Response:`, 'reset');
      console.log(JSON.stringify(result, null, 2));
      return { success: true, data: result };
    } else {
      log(`   ❌ FAILED (${response.status})`, 'red');
      log(`   Error: ${result.error || 'Unknown error'}`, 'red');
      return { success: false, error: result };
    }
  } catch (error) {
    log(`   ❌ ERROR: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('🚀 Starting NexusMind Backend Tests', 'blue');
  log(`📍 API URL: ${API_URL}`, 'yellow');
  log('━'.repeat(50), 'blue');

  let authToken = null;
  let userId = null;
  let postId = null;
  let solutionId = null;

  // Test 1: Signup
  const signupData = {
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    username: `testuser${Date.now()}`
  };
  const signupResult = await testEndpoint('Signup', 'POST', '/auth/signup', signupData);
  if (signupResult.success) {
    authToken = signupResult.data.session?.access_token;
    userId = signupResult.data.user?.id;
    log(`   🔑 Auth Token: ${authToken ? 'Received' : 'Not received'}`, authToken ? 'green' : 'red');
  }

  // Test 2: Login
  const loginResult = await testEndpoint('Login', 'POST', '/auth/login', {
    email: signupData.email,
    password: signupData.password
  });
  if (loginResult.success) {
    authToken = loginResult.data.session?.access_token;
  }

  // Test 3: Get Posts (should work without auth)
  await testEndpoint('Get All Posts', 'GET', '/posts?page=1&limit=10');

  // Test 4: Create Post (requires auth)
  if (authToken) {
    const createPostResult = await testEndpoint('Create Post', 'POST', '/posts', {
      category: 'general',
      title: 'Test Post Title',
      content: 'This is a test post content for backend testing.',
      emoji: '🧪'
    }, { Authorization: `Bearer ${authToken}` });
    
    if (createPostResult.success) {
      postId = createPostResult.data.post?.id;
      log(`   📝 Post ID: ${postId}`, 'green');
    }
  }

  // Test 5: Get Single Post
  if (postId) {
    await testEndpoint('Get Single Post', 'GET', `/posts/${postId}`);
  }

  // Test 6: Update Post (requires auth)
  if (postId && authToken) {
    await testEndpoint('Update Post', 'PUT', `/posts/${postId}`, {
      category: 'general',
      title: 'Updated Test Post',
      content: 'This post has been updated during testing.',
      isSolved: false
    }, { Authorization: `Bearer ${authToken}` });
  }

  // Test 7: Vote on Post (requires auth)
  if (postId && authToken) {
    await testEndpoint('Vote on Post', 'PATCH', `/posts/${postId}`, {
      vote: 5
    }, { Authorization: `Bearer ${authToken}` });
  }

  // Test 8: Create Solution (requires auth)
  if (postId && authToken) {
    const createSolutionResult = await testEndpoint('Create Solution', 'POST', '/solutions', {
      postId: postId,
      text: 'This is a test solution for the post.'
    }, { Authorization: `Bearer ${authToken}` });
    
    if (createSolutionResult.success) {
      solutionId = createSolutionResult.data.solution?.id;
      log(`   💡 Solution ID: ${solutionId}`, 'green');
    }
  }

  // Test 9: Vote on Solution (requires auth)
  if (solutionId && authToken) {
    await testEndpoint('Vote on Solution', 'PATCH', `/solutions/${solutionId}`, {
      upvotes: 3,
      helpful: 2
    }, { Authorization: `Bearer ${authToken}` });
  }

  // Test 10: Delete Solution (requires auth)
  if (solutionId && authToken) {
    await testEndpoint('Delete Solution', 'DELETE', `/solutions/${solutionId}`, null, {
      Authorization: `Bearer ${authToken}`
    });
  }

  // Test 11: Delete Post (requires auth)
  if (postId && authToken) {
    await testEndpoint('Delete Post', 'DELETE', `/posts/${postId}`, null, {
      Authorization: `Bearer ${authToken}`
    });
  }

  // Test 12: Logout
  if (authToken) {
    await testEndpoint('Logout', 'POST', '/auth/logout', {}, {
      Authorization: `Bearer ${authToken}`
    });
  }

  log('\n' + '━'.repeat(50), 'blue');
  log('✅ Backend Testing Complete!', 'green');
  log('\n📋 Summary:', 'blue');
  log('   - Authentication: Signup, Login, Logout', 'reset');
  log('   - Posts: Create, Read, Update, Delete, Vote', 'reset');
  log('   - Solutions: Create, Update, Delete, Vote', 'reset');
  log('\n⚠️  Note: If any tests failed, check:', 'yellow');
  log('   1. Supabase credentials in .env.local', 'reset');
  log('   2. Database schema is applied in Supabase', 'reset');
  log('   3. API server is running (vercel dev or deployed)', 'reset');
  log('   4. CORS settings in Supabase Dashboard', 'reset');
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});
