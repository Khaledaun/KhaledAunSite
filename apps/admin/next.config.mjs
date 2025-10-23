import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features for better Prisma support in monorepo
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
    outputFileTracingIncludes: {
      '/api/**/*': ['../../node_modules/.prisma/**/*'],
    },
  },
  
  // Transpile workspace packages
  transpilePackages: ['@khaledaun/auth', '@khaledaun/db', '@khaledaun/schemas', '@khaledaun/utils'],
  
  // Configure webpack to resolve workspace packages and monorepo modules
  webpack: (config, { isServer }) => {
    // Add monorepo root node_modules to resolve paths
    config.resolve.modules.push(
      path.resolve(__dirname, '../../node_modules'),
      path.resolve(__dirname, 'node_modules')
    );
    
    // Add workspace package aliases - must resolve to index files
    config.resolve.alias = {
      ...config.resolve.alias,
      '@khaledaun/auth$': path.resolve(__dirname, '../../packages/auth/index.ts'),
      '@khaledaun/auth': path.resolve(__dirname, '../../packages/auth'),
      '@khaledaun/db$': path.resolve(__dirname, '../../packages/db/index.ts'),
      '@khaledaun/db': path.resolve(__dirname, '../../packages/db'),
      '@khaledaun/schemas$': path.resolve(__dirname, '../../packages/schemas/index.ts'),
      '@khaledaun/schemas': path.resolve(__dirname, '../../packages/schemas'),
      '@khaledaun/utils$': path.resolve(__dirname, '../../packages/utils/index.ts'),
      '@khaledaun/utils': path.resolve(__dirname, '../../packages/utils'),
      '@prisma/client': path.resolve(__dirname, './node_modules/@prisma/client'),
    };
    
    // Ensure symlinks are resolved
    config.resolve.symlinks = true;
    
    return config;
  },
};

export default nextConfig;
