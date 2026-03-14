/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@telecosync/api",
    "@telecosync/database",
    "@telecosync/services",
    "@telecosync/types",
    "@telecosync/ui"
  ]
};

export default nextConfig;
