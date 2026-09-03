import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desliga o selo "N" de dev tools que fica sobreposto na tela — atrapalha
  // capturas de tela e não deve aparecer para quem está usando o app.
  devIndicators: false,
};

export default nextConfig;
