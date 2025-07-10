/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/files/:path*",
        destination: "http://localhost:3020/api/files/:path*",
      },
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


