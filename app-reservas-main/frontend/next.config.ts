/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "http://auth-service:4000/api/:path*",
      },
      {
        source: "/api/bookings/:path*",
        destination: "http://booking-service:5000/:path*",
      },
      {
        source: "/api/users/:path*",
        destination: "http://user-service:5003/users/:path*",
      }
    ];
  },
};

module.exports = nextConfig;