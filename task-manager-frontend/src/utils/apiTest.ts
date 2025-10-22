/**
 * API Integration Test Utilities
 * Test functions to verify backend API integration
 */

import { jwtAxios } from '@crema/services/auth/jwt-auth';

// Test data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'testpassword123'
};

const testLogin = {
  username: 'testuser',
  password: 'testpassword123'
};

/**
 * Test API connection
 */
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await jwtAxios.get('/api/v1/health');
    console.log('✅ API Connection Test:', response.data);
    return true;
  } catch (error) {
    console.log('❌ API Connection Test Failed:', error);
    return false;
  }
};

/**
 * Test user registration
 */
export const testUserRegistration = async (): Promise<boolean> => {
  try {
    const response = await jwtAxios.post('/api/v1/auth/register', testUser);
    console.log('✅ User Registration Test:', response.data);
    return response.data.status === true;
  } catch (error) {
    console.log('❌ User Registration Test Failed:', error);
    return false;
  }
};

/**
 * Test user login
 */
export const testUserLogin = async (): Promise<boolean> => {
  try {
    const response = await jwtAxios.post('/api/v1/auth/login', testLogin);
    console.log('✅ User Login Test:', response.data);
    return response.data.status === true && response.data.data.access_token;
  } catch (error) {
    console.log('❌ User Login Test Failed:', error);
    return false;
  }
};

/**
 * Test token refresh
 */
export const testTokenRefresh = async (): Promise<boolean> => {
  try {
    const response = await jwtAxios.post('/api/v1/auth/refresh-token');
    console.log('✅ Token Refresh Test:', response.data);
    return response.data.status === true && response.data.data.access_token;
  } catch (error) {
    console.log('❌ Token Refresh Test Failed:', error);
    return false;
  }
};

/**
 * Test user logout
 */
export const testUserLogout = async (): Promise<boolean> => {
  try {
    const response = await jwtAxios.post('/api/v1/auth/logout');
    console.log('✅ User Logout Test:', response.data);
    return response.data.status === true;
  } catch (error) {
    console.log('❌ User Logout Test Failed:', error);
    return false;
  }
};

/**
 * Run all API tests
 */
export const runAllApiTests = async (): Promise<void> => {
  console.log('🚀 Starting API Integration Tests...');
  
  const tests = [
    { name: 'API Connection', test: testApiConnection },
    { name: 'User Registration', test: testUserRegistration },
    { name: 'User Login', test: testUserLogin },
    { name: 'Token Refresh', test: testTokenRefresh },
    { name: 'User Logout', test: testUserLogout },
  ];

  const results = await Promise.allSettled(
    tests.map(async (test) => {
      const result = await test.test();
      return { name: test.name, result };
    })
  );

  console.log('📊 API Test Results:');
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`${result.value.result ? '✅' : '❌'} ${result.value.name}`);
    } else {
      console.log(`❌ ${tests[index].name} - Error: ${result.reason}`);
    }
  });
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as Record<string, unknown>).apiTest = {
    testApiConnection,
    testUserRegistration,
    testUserLogin,
    testTokenRefresh,
    testUserLogout,
    runAllApiTests
  };
}
