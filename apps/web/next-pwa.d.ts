declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface RuntimeCachingEntry {
    urlPattern: RegExp | string;
    handler: 'CacheFirst' | 'NetworkFirst' | 'StaleWhileRevalidate' | 'NetworkOnly' | 'CacheOnly';
    options?: {
      cacheName?: string;
      expiration?: {
        maxEntries?: number;
        maxAgeSeconds?: number;
      };
      cacheableResponse?: {
        statuses?: number[];
      };
    };
  }

  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    runtimeCaching?: RuntimeCachingEntry[];
    publicExcludes?: string[];
    buildExcludes?: Array<RegExp | string | ((arg0: string) => boolean)>;
    scope?: string;
    sw?: string;
    subdomainPrefix?: string;
  }

  export default function withPWA(pwaConfig: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}