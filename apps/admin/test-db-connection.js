/**
 * Database Connection Diagnostic Script
 * Tests database connectivity and identifies connection issues
 */

const { PrismaClient } = require('@prisma/client');
const { readFileSync } = require('fs');
const { join } = require('path');

// Load environment variables from .env files
function loadEnvironmentVariables() {
  const rootDir = join(__dirname, '../../../');
  const adminDir = join(__dirname);
  
  const envFiles = [
    join(rootDir, '.env.test'),
    join(rootDir, '.env.local'),
    join(rootDir, '.env'),
    join(adminDir, '.env.local'),
    join(adminDir, '.env'),
  ];
  
  for (const envFile of envFiles) {
    try {
      const content = readFileSync(envFile, 'utf-8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const match = trimmed.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      }
    } catch (error) {
      // File doesn't exist, continue
    }
  }
}

// Mask sensitive parts of connection string
function maskConnectionString(url) {
  if (!url) return 'NOT SET';
  try {
    const urlObj = new URL(url);
    const username = urlObj.username ? '***' : '';
    const password = urlObj.password ? '***' : '';
    return `${urlObj.protocol}//${username}${password ? ':***' : ''}@${urlObj.host}${urlObj.pathname}${urlObj.search ? '?' + urlObj.search.split('&').map(p => p.split('=')[0] + '=***').join('&') : ''}`;
  } catch {
    return 'INVALID URL';
  }
}

async function testConnection() {
  console.log('\n🔍 Database Connection Diagnostic');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Load environment variables
  loadEnvironmentVariables();
  
  // Check if DATABASE_URL is set
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set!');
    console.error('\n💡 Please set DATABASE_URL in one of these locations:');
    console.error('   - .env (root)');
    console.error('   - .env.local (root)');
    console.error('   - .env.test (root)');
    console.error('   - apps/admin/.env');
    console.error('   - apps/admin/.env.local');
    console.error('\n   Format: postgresql://user:password@host:port/database');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL is set');
  console.log(`   Connection: ${maskConnectionString(databaseUrl)}\n`);
  
  // Check connection string format
  if (!databaseUrl.includes('postgresql://') && !databaseUrl.includes('postgres://')) {
    console.error('❌ DATABASE_URL does not appear to be a PostgreSQL connection string');
    process.exit(1);
  }
  
  // Check if it's a Supabase pooler
  const isSupabasePooler = databaseUrl.includes('pooler.supabase.com');
  if (isSupabasePooler) {
    console.log('ℹ️  Using Supabase Connection Pooler');
    console.log('   This is good for production but may have connection limits.\n');
    
    // Check for DIRECT_URL
    if (!process.env.DIRECT_URL) {
      console.warn('⚠️  DIRECT_URL is not set');
      console.warn('   For migrations, use DIRECT_URL (direct connection)');
      console.warn('   For queries, DATABASE_URL (pooler) is fine\n');
    }
  }
  
  // Test connection
  console.log('🔌 Testing database connection...\n');
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
  
  let connectionSuccess = false;
  let querySuccess = false;
  
  try {
    // Test 1: Connection
    console.log('Test 1: Connection...');
    await prisma.$connect();
    connectionSuccess = true;
    console.log('   ✅ Connection successful!\n');
    
    // Test 2: Simple query
    console.log('Test 2: Simple query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    querySuccess = true;
    console.log('   ✅ Query successful!\n');
    
    // Test 3: Check if tables exist
    console.log('Test 3: Check database schema...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 10
    `;
    console.log(`   ✅ Found ${tables.length} tables in public schema\n`);
    
    // Test 4: Check specific models (if they exist)
    console.log('Test 4: Check Prisma models...');
    const modelChecks = [
      { name: 'User', query: () => prisma.user.count() },
      { name: 'ContentLibrary', query: () => prisma.contentLibrary.count() },
      { name: 'Topic', query: () => prisma.topic.count() },
    ];
    
    for (const check of modelChecks) {
      try {
        const count = await check.query();
        console.log(`   ✅ ${check.name}: ${count} records`);
      } catch (error) {
        console.log(`   ⚠️  ${check.name}: ${error.message.includes('does not exist') ? 'Model not found' : 'Error - ' + error.message}`);
      }
    }
    
    console.log('\n✅ All tests passed! Database connection is working.\n');
    
  } catch (error) {
    console.error('\n❌ Connection failed!\n');
    console.error('Error Details:');
    console.error(`   Type: ${error.constructor.name}`);
    console.error(`   Message: ${error.message}\n`);
    
    // Diagnose common issues
    console.log('🔍 Diagnosis:\n');
    
    if (error.message.includes("Can't reach database server")) {
      console.error('   ❌ Cannot reach database server');
      console.error('   Possible causes:');
      console.error('     1. Supabase project is paused or inactive');
      console.error('     2. Network/firewall blocking connection');
      console.error('     3. Wrong hostname or port');
      console.error('     4. Database server is down\n');
      console.error('   💡 Solutions:');
      console.error('     1. Check Supabase dashboard: https://supabase.com/dashboard');
      console.error('     2. Verify project is active (not paused)');
      console.error('     3. Check connection string format');
      console.error('     4. Try direct connection (not pooler) if pooler fails');
      console.error('     5. Check network/firewall settings\n');
    } else if (error.message.includes('authentication failed') || error.message.includes('password')) {
      console.error('   ❌ Authentication failed');
      console.error('   Possible causes:');
      console.error('     1. Wrong password');
      console.error('     2. Wrong username');
      console.error('     3. User does not have access\n');
      console.error('   💡 Solutions:');
      console.error('     1. Verify password in connection string');
      console.error('     2. Check Supabase project settings');
      console.error('     3. Reset database password if needed\n');
    } else if (error.message.includes('does not exist')) {
      console.error('   ❌ Database or schema does not exist');
      console.error('   Possible causes:');
      console.error('     1. Wrong database name');
      console.error('     2. Schema not created');
      console.error('     3. Prisma migrations not run\n');
      console.error('   💡 Solutions:');
      console.error('     1. Verify database name in connection string');
      console.error('     2. Run Prisma migrations: npx prisma migrate dev');
      console.error('     3. Check Prisma schema\n');
    } else {
      console.error('   ❌ Unknown error');
      console.error('   Full error:');
      console.error(`   ${error.stack}\n`);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run diagnostic
testConnection().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


