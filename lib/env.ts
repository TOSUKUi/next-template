import { z } from "zod";

const envSchema = z.object({
  // データベース
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // JWT認証
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),

  // アプリケーション設定
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Prisma (オプション)
  SHADOW_DATABASE_URL: z.string().optional(),

  // Next.js Public Variables
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

// 環境変数をパースして型安全にエクスポート
export const env = envSchema.parse(process.env);

// 開発時のバリデーション結果を表示
if (process.env.NODE_ENV === "development") {
  console.log("✅ Environment variables validated successfully");
}
