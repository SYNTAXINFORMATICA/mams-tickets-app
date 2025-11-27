/** @type {import('next').NextConfig} */
const nextConfig = {
  // Opciones experimentales
  experimental: {
    reactCompiler: true,
  },

  // Información de compilación
  swcMinify: true,

  // Configuración de imágenes
  images: {
    remotePatterns: [],
    unoptimized: true,
  },

  // Headers de seguridad
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },

  // Configuración de ESLint y TypeScript
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
