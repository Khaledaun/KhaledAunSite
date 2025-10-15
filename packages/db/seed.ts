import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for Phase 6 Lite...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@khaledaun.com' },
    update: {},
    create: {
      email: 'admin@khaledaun.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create a sample draft post
  const draftPost = await prisma.post.upsert({
    where: { slug: 'welcome-to-phase-6-lite' },
    update: {},
    create: {
      title: 'Welcome to Phase 6 Lite CMS',
      slug: 'welcome-to-phase-6-lite',
      excerpt: 'This is a sample draft post created during database seeding.',
      content: `# Welcome to Phase 6 Lite

This is a **draft post** created during the database seeding process.

## Features

- Single-language content (EN)
- Draft → Preview → Publish workflow
- Admin-only access
- ISR revalidation on publish

You can edit this post in the admin dashboard at \`/admin/posts\`.`,
      status: 'DRAFT',
      authorId: admin.id,
    },
  });

  console.log('✅ Draft post created:', draftPost.slug);

  // Create an audit trail for the post creation
  await prisma.audit.create({
    data: {
      entity: 'Post',
      entityId: draftPost.id,
      action: 'CREATE',
      payload: {
        title: draftPost.title,
        slug: draftPost.slug,
        status: draftPost.status,
      },
      actorId: admin.id,
    },
  });

  console.log('✅ Audit trail created for draft post');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
