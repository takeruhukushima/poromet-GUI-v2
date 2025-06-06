/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
    domains: ['localhost', 'vercel.app'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/api/histogram/**',
      },
    ],
  },
  // Only enable rewrites in development
  async rewrites() {
    // In production, these should be handled by Vercel's rewrites
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8000/api/:path*',
        },
      ];
    }
    return [];
  },
  // Add Vercel deployment configuration
  experimental: {
    serverActions: true,
  },
  // Disable React StrictMode for now to prevent double rendering in development
  reactStrictMode: false,
}

module.exports = nextConfig
