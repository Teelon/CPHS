/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  // Add trailing slash to ensure consistent URL handling
  trailingSlash: true,
  // Ensure case sensitivity is handled consistently
  poweredByHeader: false,
}

export default nextConfig

