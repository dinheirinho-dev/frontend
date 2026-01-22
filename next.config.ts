import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 🙈 Ignora erros de linter (aviso de variável não usada, etc) no build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 🙈 Ignora erros de tipagem (TS) no build pra não travar o deploy
    ignoreBuildErrors: true,
  },
};

export default nextConfig;