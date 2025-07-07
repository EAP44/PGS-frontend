/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3010/api/:path*",
      },
      {
        source: "/auth/:path*",
        destination: "http://localhost:5000/auth/:path*",
      },
    ];
  },
};

export default nextConfig;

