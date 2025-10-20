import 'dotenv/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile workspace packages
  transpilePackages: ['@khaledaun/auth', '@khaledaun/db', '@khaledaun/schemas', '@khaledaun/utils'],
  
  // Configure webpack to resolve node_modules from monorepo root
  webpack: (config, { isServer }) => {
    // Add monorepo root node_modules to resolve paths
    config.resolve.modules.push('../../node_modules');
    return config;
  },
};

export default nextConfig;
