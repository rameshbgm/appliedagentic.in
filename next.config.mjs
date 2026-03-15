/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
  serverExternalPackages: ['pdf-parse'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent Node.js-only modules from being bundled into the client.
      // logger.ts (reachable via dynamic import in utils.ts) uses `fs`.
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false }
    }
    return config
  },
}

export default config
