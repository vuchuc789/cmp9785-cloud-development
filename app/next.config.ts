import withBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.openverse.org',
        port: '',
        pathname: '/v1/images/**',
        search: '',
      },
    ],
  },
  output: 'standalone',
};

if (process.env.ANALYZE === 'true') {
  nextConfig = withBundleAnalyzer()(nextConfig);
}

export default nextConfig;
