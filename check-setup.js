/**
 * Setup Checker Script
 * 
 * This script checks if your environment is properly configured
 * Run with: node check-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Mubasharat Setup...\n');

let hasErrors = false;

// Check 1: .env file
console.log('1️⃣ Checking .env file...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('DATABASE_URL=')) {
    console.log('   ✅ DATABASE_URL is configured');
    
    // Check if it's MySQL
    if (envContent.includes('mysql://')) {
      console.log('   ✅ Using MySQL database');
    } else if (envContent.includes('postgresql://')) {
      console.log('   ⚠️  WARNING: Schema is set to MySQL but DATABASE_URL uses PostgreSQL');
      hasErrors = true;
    }
  } else {
    console.log('   ❌ DATABASE_URL is not configured');
    hasErrors = true;
  }
  
  if (envContent.includes('JWT_SECRET=') && !envContent.includes('JWT_SECRET="your-super-secret')) {
    console.log('   ✅ JWT_SECRET is configured');
  } else {
    console.log('   ⚠️  WARNING: JWT_SECRET should be changed from default');
  }
} else {
  console.log('   ❌ .env file not found');
  console.log('   📝 Create .env file with:');
  console.log('      DATABASE_URL="mysql://user:password@localhost:3306/tafseer_elahlam"');
  console.log('      JWT_SECRET="your-secret-key-here"');
  hasErrors = true;
}

// Check 2: Prisma schema
console.log('\n2️⃣ Checking Prisma schema...');
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  console.log('   ✅ Prisma schema exists');
  
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  if (schemaContent.includes('provider = "mysql"')) {
    console.log('   ✅ Schema configured for MySQL');
  } else if (schemaContent.includes('provider = "postgresql"')) {
    console.log('   ❌ Schema is configured for PostgreSQL but should be MySQL');
    hasErrors = true;
  }
} else {
  console.log('   ❌ Prisma schema not found');
  hasErrors = true;
}

// Check 3: Prisma Client
console.log('\n3️⃣ Checking Prisma Client...');
const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma', 'client');
if (fs.existsSync(prismaClientPath)) {
  console.log('   ✅ Prisma Client generated');
} else {
  console.log('   ⚠️  Prisma Client not generated');
  console.log('   📝 Run: npx prisma generate');
}

// Check 4: node_modules
console.log('\n4️⃣ Checking dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules exists');
  
  // Check for Prisma
  if (fs.existsSync(path.join(nodeModulesPath, '@prisma', 'client'))) {
    console.log('   ✅ @prisma/client installed');
  } else {
    console.log('   ❌ @prisma/client not installed');
    hasErrors = true;
  }
  
  // Check for bcryptjs
  if (fs.existsSync(path.join(nodeModulesPath, 'bcryptjs'))) {
    console.log('   ✅ bcryptjs installed');
  } else {
    console.log('   ❌ bcryptjs not installed');
    hasErrors = true;
  }
  
  // Check for jsonwebtoken
  if (fs.existsSync(path.join(nodeModulesPath, 'jsonwebtoken'))) {
    console.log('   ✅ jsonwebtoken installed');
  } else {
    console.log('   ❌ jsonwebtoken not installed');
    hasErrors = true;
  }
} else {
  console.log('   ❌ node_modules not found');
  console.log('   📝 Run: npm install --legacy-peer-deps');
  hasErrors = true;
}

// Final summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Setup has errors. Please fix the issues above.');
  console.log('\n📋 Quick fix commands:');
  console.log('   1. npm install --legacy-peer-deps');
  console.log('   2. Create .env file with proper configuration');
  console.log('   3. npx prisma generate');
  console.log('   4. npx prisma db push');
  console.log('   5. npm run prisma:seed');
} else {
  console.log('✅ Setup looks good!');
  console.log('\n📋 Next steps:');
  console.log('   1. Make sure MySQL is running');
  console.log('   2. Run: npx prisma db push');
  console.log('   3. Run: npm run prisma:seed');
  console.log('   4. Run: npm run dev');
}
console.log('='.repeat(50));

