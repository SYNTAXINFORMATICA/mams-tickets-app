/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Compiler (clave a nivel raíz en Next 16)
  reactCompiler: true,

  // Configuración de imágenes
  images: {
    remotePatterns: [],
    unoptimized: true, // si usas sharp, considera poner false y aprobar builds
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

  // Configuración de TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },

  // Nota: swcMinify y eslint ya no se configuran aquí
};

export default nextConfig;
