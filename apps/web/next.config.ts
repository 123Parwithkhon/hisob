import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@hisob/api'],
  output: 'standalone',
  
  // ✅ Добавь это чтобы исправить ошибку Turbopack
  turbopack: {},
  
  // Или если хочешь использовать webpack вместо Turbopack:
  // experimental: {
  //   turbo: {
  //     rules: {}
  //   }
  // }
};

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);

export default config;