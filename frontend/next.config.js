/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // The imported project has a large pre-existing ESLint backlog. TypeScript is
  // still checked during builds; lint is run separately while that backlog is fixed.
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: false,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
