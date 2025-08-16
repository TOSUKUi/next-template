import type { NextConfig } from "next";
import "./lib/env"; // 環境変数の早期バリデーション

const nextConfig: NextConfig = {
  eslint: {
    // ビルド時にESLintエラーがあるとビルドを失敗させる
    ignoreDuringBuilds: false,
  },
  typescript: {
    // ビルド時にTypeScriptエラーがあるとビルドを失敗させる
    ignoreBuildErrors: false,
  },
  // 実験的な機能（必要に応じて）
  experimental: {
    // Server Actionsを有効化（Next.js 15では安定版）
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
