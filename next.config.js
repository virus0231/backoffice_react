/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimization for cPanel hosting
  output: 'standalone',

  // Image optimization settings for shared hosting
  images: {
    unoptimized: true, // Disable Next.js image optimization for cPanel compatibility
  },

  // Environment configuration
  env: {
    CUSTOM_KEY: 'my-value',
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Webpack configuration for optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }

    return config;
  },

  // Trailing slash handling for consistent URLs
  trailingSlash: false,

  // Static file serving optimization
  assetPrefix: '',

  // Compression settings
  compress: true,

  // PoweredByHeader removal for security
  poweredByHeader: false,

  // React strict mode for better development experience
  reactStrictMode: true,
};

module.exports = nextConfig;