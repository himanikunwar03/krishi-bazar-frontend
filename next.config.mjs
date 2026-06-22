/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8089';
    
    return [
      // Public endpoints (no authentication required)
      {
        source: '/api/public/:path*',
        destination: `${API_BASE_URL}/api/public/:path*`,
      },
      // Protected endpoints (authentication required)
      {
        source: '/api/protected/:path*',
        destination: `${API_BASE_URL}/api/protected/:path*`,
      },
      // Direct API proxy for all other routes
      {
        source: '/api/:path*',
        destination: `${API_BASE_URL}/api/:path*`,
      },
    ];
  },
}

export default nextConfig
