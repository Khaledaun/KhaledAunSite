#!/usr/bin/env tsx
/**
 * Phase 6.5: Database Migration Script
 * Migrates MediaAsset schema to support rich media library
 * 
 * Run: tsx packages/db/scripts/migrate-phase6.5-media.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Phase 6.5 media migration...\n');

  try {
    // 1. Check for existing media assets
    const existingMedia = await prisma.mediaAsset.findMany();
    console.log(`📊 Found ${existingMedia.length} existing media assets\n`);

    if (existingMedia.length > 0) {
      console.log('🔄 Migrating existing media assets...');
      
      for (const media of existingMedia) {
        // Add default values for new fields
        await prisma.mediaAsset.update({
          where: { id: media.id },
          data: {
            originalName: media.originalName || media.filename,
            thumbnailUrl: media.thumbnailUrl || null,
            width: media.width || null,
            height: media.height || null,
            duration: media.duration || null,
            folder: media.folder || 'legacy',
            tags: media.tags || [],
            // uploadedBy will need to be set based on your user data
            // If you don't have user data, you'll need to handle this separately
          },
        });
      }
      
      console.log(`✅ Migrated ${existingMedia.length} media assets\n`);
    }

    // 2. Verify migration
    console.log('🔍 Verifying migration...');
    const updatedMedia = await prisma.mediaAsset.findMany({
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: 5,
    });

    console.log(`\n✅ Sample migrated media assets:`);
    updatedMedia.forEach((media, index) => {
      console.log(`\n${index + 1}. ${media.originalName}`);
      console.log(`   - URL: ${media.url}`);
      console.log(`   - Thumbnail: ${media.thumbnailUrl || 'N/A'}`);
      console.log(`   - Size: ${(media.size / 1024).toFixed(2)} KB`);
      console.log(`   - Folder: ${media.folder || 'N/A'}`);
      console.log(`   - Uploaded by: ${media.uploader?.name || media.uploader?.email || 'Unknown'}`);
    });

    console.log('\n✅ Phase 6.5 migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


