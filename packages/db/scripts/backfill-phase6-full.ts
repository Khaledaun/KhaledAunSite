/**
 * Phase 6 Full: Backfill Script
 * Migrates existing single-language posts to bilingual model
 * Creates English (en) translations for all existing posts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Phase 6 Full backfill migration...\n');

  // Get all existing posts
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  console.log(`📊 Found ${posts.length} posts to migrate\n`);

  if (posts.length === 0) {
    console.log('✅ No posts to migrate. Database is empty.');
    return;
  }

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const post of posts) {
    try {
      // Check if English translation already exists
      const existingTranslation = await prisma.postTranslation.findUnique({
        where: {
          postId_locale: {
            postId: post.id,
            locale: 'en',
          },
        },
      });

      if (existingTranslation) {
        console.log(`⏭️  Skipping post "${post.title}" - EN translation already exists`);
        skipCount++;
        continue;
      }

      // Create English translation
      await prisma.postTranslation.create({
        data: {
          postId: post.id,
          locale: 'en',
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || null,
          content: post.content,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        },
      });

      console.log(`✅ Migrated post "${post.title}" (slug: ${post.slug})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error migrating post "${post.title}":`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Backfill Migration Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Successfully migrated: ${successCount} posts`);
  console.log(`⏭️  Skipped (already migrated): ${skipCount} posts`);
  console.log(`❌ Errors: ${errorCount} posts`);
  console.log('='.repeat(60));

  if (errorCount > 0) {
    console.log('\n⚠️  Some posts failed to migrate. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 Backfill migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run verification script: pnpm tsx packages/db/scripts/verify-post-translations.ts');
    console.log('   2. Test admin UI with bilingual posts');
    console.log('   3. Once verified, legacy columns can be dropped in a future migration');
  }
}

main()
  .catch((e) => {
    console.error('\n❌ Backfill migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

