/** @type {import('next').NextConfig} */
// Force rebuild - Arabic translations should work
const withNextIntl = require('next-intl/plugin')(
  './src/i18n/request.js'
);

const nextConfig = {
  images: {
    domains: [
      'worldtme.com', 
      'www.lvj-visa.com', 
      'www.nas-law.com',
      'images.unsplash.com',
      'via.placeholder.com'
    ]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: false,
      },
    ];
  },
  // Force dynamic rendering for locale-specific pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = withNextIntl(nextConfig);
