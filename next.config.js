/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable static generation for better performance
  output: 'standalone',
  // Optimize fonts
  optimizeFonts: true,
  // Compress output
  compress: true,
}

module.exports = nextConfig

