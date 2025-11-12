/**
 * Environment Variable Validation
 * 
 * Validates that all required environment variables are set before running tests.
 * This should be called in globalSetup or test setup.
 */

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateTestEnvironment(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // Required environment variables
  const required = [
    'DATABASE_URL',
  ];
  
  // Optional but recommended
  const recommended = [
    'DIRECT_URL',
    'ADMIN_API_URL',
    'NEXT_PUBLIC_ADMIN_API_URL',
  ];
  
  // Check required variables
  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  // Check recommended variables
  for (const varName of recommended) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }
  
  // Validate DATABASE_URL format if set
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl.includes('postgresql://') && !dbUrl.includes('postgres://')) {
      warnings.push('DATABASE_URL does not appear to be a PostgreSQL connection string');
    }
    
    // Check for Supabase pooler
    if (dbUrl.includes('pooler.supabase.com')) {
      if (!process.env.DIRECT_URL) {
        warnings.push('Using Supabase pooler but DIRECT_URL is not set (recommended for migrations)');
      }
    }
  }
  
  // Validate ADMIN_API_URL if set
  if (process.env.ADMIN_API_URL || process.env.NEXT_PUBLIC_ADMIN_API_URL) {
    const adminUrl = process.env.ADMIN_API_URL || process.env.NEXT_PUBLIC_ADMIN_API_URL;
    if (!adminUrl?.startsWith('http://') && !adminUrl?.startsWith('https://')) {
      warnings.push('ADMIN_API_URL should start with http:// or https://');
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export function printEnvironmentReport(): void {
  const result = validateTestEnvironment();
  
  console.log('\n📋 Environment Variable Validation\n');
  
  if (result.valid) {
    console.log('✅ All required environment variables are set\n');
  } else {
    console.error('❌ Missing required environment variables:');
    for (const varName of result.missing) {
      console.error(`   - ${varName}`);
    }
    console.error('');
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️  Warnings:');
    for (const warning of result.warnings) {
      console.warn(`   - ${warning}`);
    }
    console.warn('');
  }
  
  // Show current values (masked)
  console.log('📝 Current Environment Variables:');
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set (masked)' : '❌ Not set'}`);
  console.log(`   DIRECT_URL: ${process.env.DIRECT_URL ? '✅ Set (masked)' : '❌ Not set'}`);
  console.log(`   ADMIN_API_URL: ${process.env.ADMIN_API_URL || '❌ Not set'}`);
  console.log(`   NEXT_PUBLIC_ADMIN_API_URL: ${process.env.NEXT_PUBLIC_ADMIN_API_URL || '❌ Not set'}`);
  console.log(`   BASE_URL: ${process.env.BASE_URL || 'http://localhost:3000 (default)'}`);
  console.log('');
  
  if (!result.valid) {
    console.error('💡 Please set the missing environment variables and try again.');
    console.error('   Create a .env.test file or set them in your environment.\n');
    process.exit(1);
  }
}




