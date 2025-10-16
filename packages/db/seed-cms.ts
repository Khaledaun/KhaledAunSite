import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CMS data...');

  // Seed Hero Titles
  const heroTitles = [
    {
      titleEn: 'Litigation Expert',
      titleAr: 'خبير التقاضي',
      order: 1,
      enabled: true,
    },
    {
      titleEn: 'Conflict Resolution and Prevention Advisor',
      titleAr: 'مستشار حل ومنع النزاعات',
      order: 2,
      enabled: true,
    },
    {
      titleEn: 'Certified Arbitrator (CiArb)',
      titleAr: 'محكم معتمد (CiArb)',
      order: 3,
      enabled: true,
    },
    {
      titleEn: 'Cross Border Legal Counsel',
      titleAr: 'مستشار قانوني عبر الحدود',
      order: 4,
      enabled: true,
    },
  ];

  for (const title of heroTitles) {
    await prisma.heroTitle.upsert({
      where: { id: `seed-${title.order}` },
      update: title,
      create: {
        id: `seed-${title.order}`,
        ...title,
      },
    });
  }

  console.log('✅ Hero titles seeded');

  // Seed Experiences
  const experiences = [
    {
      id: 'exp-facebook',
      company: 'Facebook',
      role: 'Senior Legal Counsel',
      startDate: '2019',
      endDate: '2023',
      description: 'Led complex international legal matters and strategic business initiatives for one of the world\'s largest technology companies.',
      order: 1,
      enabled: true,
      logoUrl: '/images/experience/facebook.png',
    },
    {
      id: 'exp-google',
      company: 'Google',
      role: 'Legal Strategy Advisor',
      startDate: '2018',
      endDate: '2019',
      description: 'Provided strategic legal guidance for global business expansion and technology innovation initiatives.',
      order: 2,
      enabled: true,
      logoUrl: '/images/experience/google.png',
    },
    {
      id: 'exp-lenovo',
      company: 'Lenovo',
      role: 'International Legal Counsel',
      startDate: '2013',
      endDate: '2018',
      description: 'Specialized in international commercial law and cross-border dispute resolution for global technology operations.',
      order: 3,
      enabled: true,
      logoUrl: '/images/experience/lenovo.png',
    },
    {
      id: 'exp-circleci',
      company: 'CircleCI',
      role: 'Legal Advisory',
      startDate: '2011',
      endDate: '2013',
      description: 'Provided comprehensive legal support for a fast-growing technology startup, focusing on business formation and growth strategies.',
      order: 4,
      enabled: true,
      logoUrl: '/images/experience/circleci.png',
    },
  ];

  for (const exp of experiences) {
    await prisma.experience.upsert({
      where: { id: exp.id },
      update: exp,
      create: exp,
    });
  }

  console.log('✅ Experiences seeded');

  // Seed Hero Media (default to image)
  await prisma.heroMedia.upsert({
    where: { id: 'hero-media-default' },
    update: {
      type: 'IMAGE',
      imageUrl: '/images/hero/khaled-portrait.jpg',
      enabled: true,
    },
    create: {
      id: 'hero-media-default',
      type: 'IMAGE',
      imageUrl: '/images/hero/khaled-portrait.jpg',
      enabled: true,
    },
  });

  console.log('✅ Hero media seeded');

  console.log('🎉 CMS seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

