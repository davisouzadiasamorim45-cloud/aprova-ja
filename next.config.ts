import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desliga o selo "N" de dev tools que fica sobreposto na tela — atrapalha
  // capturas de tela e não deve aparecer para quem está usando o app.
  devIndicators: false,

  experimental: {
    serverActions: {
      // Padrão do Next é 1 MB — pequeno demais pra foto de redação enviada
      // pra transcrição (ver transcreverImagemAction, que já limita a 10 MB).
      bodySizeLimit: "12mb",
    },
  },

  images: {
    // Fotos de perfil ficam no Storage do Supabase (bucket "avatars"). Um
    // padrão amplo (*.supabase.co) em vez do host exato do projeto evita
    // quebrar caso o projeto Supabase mude entre ambientes.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/avatars/**",
      },
    ],
  },
};

export default nextConfig;
