/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Security headers
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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Bundle analysis (only in development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      if (!dev && !isServer) {
        config.plugins.push(
          new webpack.DefinePlugin({
            __BUNDLE_ANALYZE__: JSON.stringify(process.env.ANALYZE),
          })
        );
      }
      return config;
    },
  }),

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Redirects for SEO and user experience
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Rewrites for API routes (if needed)
  async rewrites() {
    return [
      // Add any necessary rewrites here
    ];
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Build optimization
  // Only enable 'standalone' output when explicitly requested; not needed on Vercel
  ...(process.env.NEXT_OUTPUT_STANDALONE === '1' ? { output: 'standalone' } : {}),
  generateEtags: false, // Disable etags for better caching control

  // Compression
  compress: true,

  // Powered by header removal
  poweredByHeader: false,
};

module.exports = nextConfig;
