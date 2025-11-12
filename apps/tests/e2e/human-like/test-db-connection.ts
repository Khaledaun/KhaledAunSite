/**
 * Database Connection Test Script
 * 
 * This script verifies that we can connect to the database before running tests.
 * Run this manually to diagnose database connectivity issues.
 * 
 * Usage: npx tsx apps/tests/e2e/human-like/test-db-connection.ts
 */

import { PrismaClient } from '@khaledaun/db';

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`  DIRECT_URL: ${process.env.DIRECT_URL ? '✅ Set' : '❌ Missing'}`);
  
  if (!process.env.DATABASE_URL) {
    console.error('\n❌ ERROR: DATABASE_URL is not set!');
    console.error('   Please set DATABASE_URL in your .env file or environment.');
    process.exit(1);
  }
  
  if (!process.env.DIRECT_URL) {
    console.warn('\n⚠️  WARNING: DIRECT_URL is not set!');
    console.warn('   Some operations may fail. Set DIRECT_URL for direct database connections.');
  }
  
  // Show connection string (masked for security)
  const dbUrl = process.env.DATABASE_URL;
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
  console.log(`  Connection: ${maskedUrl}`);
  
  // Initialize Prisma Client
  console.log('\n🔌 Initializing Prisma Client...');
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
  
  try {
    // Test basic connection
    console.log('\n📡 Testing basic connection...');
    await prisma.$connect();
    console.log('  ✅ Connected to database');
    
    // Test query
    console.log('\n📊 Testing query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('  ✅ Query successful:', result);
    
    // Test table access
    console.log('\n🗄️  Testing table access...');
    const topicCount = await prisma.topic.count().catch(() => null);
    if (topicCount !== null) {
      console.log(`  ✅ Topics table accessible (count: ${topicCount})`);
    } else {
      console.log('  ⚠️  Topics table not accessible (may not exist or no permissions)');
    }
    
    const userCount = await prisma.user.count().catch(() => null);
    if (userCount !== null) {
      console.log(`  ✅ Users table accessible (count: ${userCount})`);
    } else {
      console.log('  ⚠️  Users table not accessible (may not exist or no permissions)');
    }
    
    // Test write operation
    console.log('\n✍️  Testing write operation...');
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@test.com`,
        name: 'Test User',
      },
    });
    console.log('  ✅ Write operation successful:', testUser.id);
    
    // Cleanup
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('  ✅ Test data cleaned up');
    
    console.log('\n✅ All database connection tests passed!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Ensure DATABASE_URL and DIRECT_URL are set correctly');
    console.log('   2. Verify your Supabase project is active');
    console.log('   3. Check network/firewall settings if connection fails');
    console.log('   4. Run your tests: npx playwright test');
    
  } catch (error: any) {
    console.error('\n❌ Database connection test failed!');
    console.error('\nError Details:');
    console.error(`  Code: ${error.code || 'N/A'}`);
    console.error(`  Message: ${error.message || 'Unknown error'}`);
    
    if (error.code === 'P1001') {
      console.error('\n🔧 Troubleshooting P1001 (Can\'t reach database server):');
      console.error('   1. Check if your Supabase project is paused (unpause it in Supabase dashboard)');
      console.error('   2. Verify DATABASE_URL points to the correct database');
      console.error('   3. Check network connectivity: Can you reach Supabase from your machine?');
      console.error('   4. Verify firewall/VPN settings aren\'t blocking the connection');
      console.error('   5. Check if you\'re using the correct connection pooler URL');
    } else if (error.code === 'P1000') {
      console.error('\n🔧 Troubleshooting P1000 (Authentication failed):');
      console.error('   1. Verify your database password in DATABASE_URL is correct');
      console.error('   2. Check if your database user has the correct permissions');
      console.error('   3. Regenerate your database password in Supabase if needed');
    } else if (error.code === 'P1017') {
      console.error('\n🔧 Troubleshooting P1017 (Server closed connection):');
      console.error('   1. Your database connection may have timed out');
      console.error('   2. Check connection pooler settings');
      console.error('   3. Try using DIRECT_URL for direct connections');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the test
testDatabaseConnection().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});




