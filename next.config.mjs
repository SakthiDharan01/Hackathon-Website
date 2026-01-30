/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Proxy backend calls through the Next.js server to avoid browser CORS issues.
    // Set API_BASE_URL (server-only) or NEXT_PUBLIC_API_BASE_URL for local/dev.
    const backendBase = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    return [
      {
        source: '/backend/:path*',
        destination: `${backendBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
