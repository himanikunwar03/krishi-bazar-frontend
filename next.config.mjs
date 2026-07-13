/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8088',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**.onrender.com',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';
    
    return [
      // Proxy all API requests to backend
      {
        source: '/api/:path*',
        destination: `${API_BASE_URL}/api/:path*`,
      },
      // Proxy uploads directory for images
      {
        source: '/uploads/:path*',
        destination: `${API_BASE_URL}/uploads/:path*`,
      },
    ];
  },
}

export default nextConfig
