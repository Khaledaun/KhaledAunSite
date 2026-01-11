export const locales = ['en', 'ar', 'he'];
export const defaultLocale = 'en';

export const pathnames = {
  '/': '/',
  '/about': {
    en: '/about',
    ar: '/حول',
    he: '/אודות'
  },
  '/ventures': {
    en: '/ventures',
    ar: '/المشاريع',
    he: '/מיזמים'
  },
  '/contact': {
    en: '/contact',
    ar: '/اتصل',
    he: '/צור-קשר'
  },
  // Firm website paths
  '/team': {
    en: '/team',
    ar: '/الفريق',
    he: '/הצוות'
  },
  '/practice-areas': {
    en: '/practice-areas',
    ar: '/مجالات-الممارسة',
    he: '/תחומי-עיסוק'
  },
  '/news': {
    en: '/news',
    ar: '/الأخبار',
    he: '/חדשות'
  },
  '/community': {
    en: '/community',
    ar: '/المجتمع',
    he: '/קהילה'
  }
};

export const localePrefix = 'always'; // or 'as-needed'

// RTL locales
export const rtlLocales = ['ar', 'he'];