/**
 * Phase 6 Full: Verification Script
 * Verifies that all posts have required translations
 * Checks data integrity after backfill migration
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VerificationResult {
  passed: boolean;
  message: string;
  details?: any;
}

async function main() {
  console.log('🔍 Starting Phase 6 Full verification...\n');

  const results: VerificationResult[] = [];

  // Test 1: Check all posts have at least one translation
  console.log('Test 1: Checking all posts have at least one translation...');
  const postsWithoutTranslations = await prisma.post.findMany({
    where: {
      translations: {
        none: {},
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  if (postsWithoutTranslations.length === 0) {
    console.log('✅ All posts have at least one translation\n');
    results.push({
      passed: true,
      message: 'All posts have translations',
    });
  } else {
    console.log(`❌ Found ${postsWithoutTranslations.length} posts without translations:`);
    postsWithoutTranslations.forEach((post) => {
      console.log(`   - ${post.title} (${post.slug})`);
    });
    console.log('');
    results.push({
      passed: false,
      message: `${postsWithoutTranslations.length} posts missing translations`,
      details: postsWithoutTranslations,
    });
  }

  // Test 2: Check all posts have English translation
  console.log('Test 2: Checking all posts have English (en) translation...');
  const postsWithoutEnglish = await prisma.post.findMany({
    where: {
      translations: {
        none: {
          locale: 'en',
        },
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  if (postsWithoutEnglish.length === 0) {
    console.log('✅ All posts have English translation\n');
    results.push({
      passed: true,
      message: 'All posts have English translations',
    });
  } else {
    console.log(`❌ Found ${postsWithoutEnglish.length} posts without English translation:`);
    postsWithoutEnglish.forEach((post) => {
      console.log(`   - ${post.title} (${post.slug})`);
    });
    console.log('');
    results.push({
      passed: false,
      message: `${postsWithoutEnglish.length} posts missing English translation`,
      details: postsWithoutEnglish,
    });
  }

  // Test 3: Check for duplicate slugs per locale
  console.log('Test 3: Checking for duplicate slugs per locale...');
  const duplicateSlugs = await prisma.$queryRaw<
    Array<{ locale: string; slug: string; count: number }>
  >`
    SELECT locale, slug, COUNT(*) as count
    FROM post_translations
    GROUP BY locale, slug
    HAVING COUNT(*) > 1
  `;

  if (duplicateSlugs.length === 0) {
    console.log('✅ No duplicate slugs found\n');
    results.push({
      passed: true,
      message: 'No duplicate slugs per locale',
    });
  } else {
    console.log(`❌ Found ${duplicateSlugs.length} duplicate slugs:`);
    duplicateSlugs.forEach((dup) => {
      console.log(`   - Locale: ${dup.locale}, Slug: ${dup.slug}, Count: ${dup.count}`);
    });
    console.log('');
    results.push({
      passed: false,
      message: `${duplicateSlugs.length} duplicate slugs found`,
      details: duplicateSlugs,
    });
  }

  // Test 4: Get translation statistics
  console.log('Test 4: Translation statistics...');
  const totalPosts = await prisma.post.count();
  const totalTranslations = await prisma.postTranslation.count();
  const enTranslations = await prisma.postTranslation.count({
    where: { locale: 'en' },
  });
  const arTranslations = await prisma.postTranslation.count({
    where: { locale: 'ar' },
  });

  console.log(`📊 Total posts: ${totalPosts}`);
  console.log(`📊 Total translations: ${totalTranslations}`);
  console.log(`   - English (en): ${enTranslations}`);
  console.log(`   - Arabic (ar): ${arTranslations}`);
  console.log('');

  results.push({
    passed: true,
    message: 'Statistics collected',
    details: {
      totalPosts,
      totalTranslations,
      enTranslations,
      arTranslations,
    },
  });

  // Test 5: Sample a few posts to verify data integrity
  console.log('Test 5: Verifying data integrity for sample posts...');
  const samplePosts = await prisma.post.findMany({
    take: 3,
    include: {
      translations: true,
    },
  });

  let integrityPassed = true;
  for (const post of samplePosts) {
    const enTranslation = post.translations.find((t) => t.locale === 'en');
    if (enTranslation) {
      // Check if legacy data matches translation
      const titleMatches = post.title === enTranslation.title;
      const slugMatches = post.slug === enTranslation.slug;
      const contentMatches = post.content === enTranslation.content;

      if (titleMatches && slugMatches && contentMatches) {
        console.log(`✅ Post "${post.title}" - data integrity verified`);
      } else {
        console.log(`⚠️  Post "${post.title}" - data mismatch detected:`);
        if (!titleMatches) console.log(`   - Title mismatch`);
        if (!slugMatches) console.log(`   - Slug mismatch`);
        if (!contentMatches) console.log(`   - Content mismatch`);
        integrityPassed = false;
      }
    }
  }
  console.log('');

  if (integrityPassed) {
    results.push({
      passed: true,
      message: 'Data integrity verified for sample posts',
    });
  } else {
    results.push({
      passed: false,
      message: 'Data integrity issues found in sample posts',
    });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Verification Summary:');
  console.log('='.repeat(60));

  const passedTests = results.filter((r) => r.passed).length;
  const totalTests = results.length;

  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} Test ${index + 1}: ${result.message}`);
  });

  console.log('='.repeat(60));
  console.log(`\n${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All verification tests passed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test admin UI with bilingual posts');
    console.log('   2. Test per-locale preview and publish');
    console.log('   3. Once verified in production, legacy columns can be dropped');
    console.log('\n✅ Phase 6 Full migration is ready!');
  } else {
    console.log('\n⚠️  Some verification tests failed. Please review the issues above.');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('\n❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

