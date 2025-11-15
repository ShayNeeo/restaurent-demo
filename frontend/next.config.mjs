/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/old-page.tsx', '**/.next/**', '**/node_modules/**'],
    };
    return config;
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js']
};

export default nextConfig;

