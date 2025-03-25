import withBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
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
