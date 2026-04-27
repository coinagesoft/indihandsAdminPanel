/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ✅ REQUIRED for GitHub Pages

  basePath: '/NaukriAdminPanel',
  assetPrefix: '/NaukriAdminPanel/',

  images: {
    unoptimized: true, // ✅ required for static export
  },

  experimental: {
    serverComponentsExternalPackages: [
      "@sparticuz/chromium",
      "puppeteer-core"
    ],
  },
};

export default nextConfig;