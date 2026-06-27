#!/usr/bin/env node

/**
 * Test script to verify Parameter Store integration
 * Run: node backend/test-secrets.js
 */

import { getDatabaseConfig, testParameterStoreConnection } from './lib/secrets.js';

async function runTests() {
  console.log('🧪 Testing Parameter Store Integration...\n');

  try {
    // Test 1: Connection test
    console.log('Test 1: Testing Parameter Store connection...');
    const isConnected = await testParameterStoreConnection();
    
    if (isConnected) {
      console.log('✅ Parameter Store connection successful\n');
    } else {
      console.log('❌ Parameter Store connection failed\n');
      console.log('Make sure:');
      console.log('  1. AWS credentials are configured');
      console.log('  2. AWS_REGION environment variable is set');
      console.log('  3. IAM role has SSM permissions');
      process.exit(1);
    }

    // Test 2: Retrieve database config
    console.log('Test 2: Retrieving database configuration...');
    const dbConfig = await getDatabaseConfig();
    
    console.log('✅ Database configuration retrieved successfully:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}`);
    console.log(`   Password: ${dbConfig.password.substring(0, 3)}${'*'.repeat(dbConfig.password.length - 3)}\n`);

    // Test 3: Validate configuration
    console.log('Test 3: Validating database configuration...');
    const requiredFields = ['host', 'port', 'database', 'user', 'password'];
    const missingFields = requiredFields.filter(field => !dbConfig[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ All required fields present\n');
    } else {
      console.log(`❌ Missing fields: ${missingFields.join(', ')}\n`);
      process.exit(1);
    }

    console.log('🎉 All tests passed! Parameter Store integration is working correctly.\n');
    console.log('You can now deploy the backend to production.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Check AWS credentials: aws sts get-caller-identity');
    console.error('  2. Check region: echo $AWS_REGION');
    console.error('  3. Check parameters exist: aws ssm get-parameters --names /ogafix/db/password /ogafix/db/username');
    console.error('  4. Check IAM permissions for SSM access');
    process.exit(1);
  }
}

runTests();
