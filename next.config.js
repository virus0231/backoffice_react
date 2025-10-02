/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimization for cPanel hosting
  // output: 'standalone', // Standalone build for cPanel compatibility
  output: 'export', // Static HTML export for shared hosting
  basePath: '/insights', // Base path for the application
  assetPrefix: '/insights/', // Asset prefix for static files

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
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Cache static assets for 1 year
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };

      // Tree shaking for better bundle size
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // Bundle analysis in development
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    return config;
  },

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    gzipSize: true,
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