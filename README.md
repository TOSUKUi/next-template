# Next.js Template

Next.js 15 + Mantine v8 + Prisma + MariaDB を使用したモダンなWebアプリケーションのテンプレート

> **重要**: 全てのコマンドは `docker compose exec app <command>` 形式で実行してください

## ✨ 主な特徴

- **フルスタックTypeScript**: フロントエンドからバックエンド、データベース操作まで一貫して型安全
- **明確な責務分離**: データ取得（API Routes）とデータ更新（Server Actions）を明確に分離
- **コンポーネントベース**: 再利用可能なUIコンポーネント群による効率的なUI開発
- **型安全な環境変数**: Zodによる環境変数のバリデーション
- **包括的テスト**: ユニットテスト（Jest）とE2Eテスト（Playwright）の両方をサポート

## 🚀 技術スタック

- **フレームワーク**: [Next.js 15](https://nextjs.org/) (App Router)
- **UIライブラリ**: [Mantine v8](https://mantine.dev/)
- **データベース**: [MariaDB 10.11](https://mariadb.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **バリデーション**: [Zod](https://zod.dev/)
- **テスト**: [Jest](https://jestjs.io/) (ユニット) + [Playwright](https://playwright.dev/) (E2E)
- **コンテナ**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **言語**: [TypeScript](https://www.typescriptlang.org/)

## 📋 機能

### 🏗️ アーキテクチャ
- **取得系処理**: API Routes (`app/api/*`)
- **更新系処理**: Server Actions (`app/actions/*`)
- **型安全**: TypeScriptとPrismaによる完全な型安全性
- **レスポンシブ**: Mantineによるモバイルファーストデザイン

### 🧩 コンポーネント
- 汎用レイアウトコンポーネント
- フォーム管理（ユーザー・商品CRUD）
- データテーブル（ページネーション・検索機能付き）
- 削除確認モーダル

### ✅ テスト
- **ユニットテスト**: Jest + Testing Library
- **E2Eテスト**: Playwright
- **カバレッジ**: 70%以上の目標設定

## 🛠️ クイックスタート

### 前提条件
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### セットアップ（3ステップ）

1. **プロジェクト準備**
```bash
git clone <repository-url>
cd next-template
cp .env.example .env  # 必要に応じて環境変数を編集
```

2. **Docker環境起動**
```bash
docker compose up -d  # 自動的にnpm run devも起動します
```

3. **データベース初期化**
```bash
docker compose exec app npm run db:push
```

🎉 **完了！** ブラウザで http://localhost:3000 を開いてください

## 🏃‍♂️ 開発

### 基本コマンド

```bash
# 開発サーバー起動
docker compose up -d

# ログ確認
docker compose logs -f app

# データベース管理
docker compose exec app npm run db:studio

# テスト実行
docker compose exec app npm run test
docker compose exec app npm run test:e2e

# ビルド
docker compose exec app npm run build

# Lint
docker compose exec app npm run lint
```

### データベース操作

```bash
# Prisma Studio起動
docker compose exec app npm run db:studio

# マイグレーション作成
docker compose exec app npm run db:migrate

# スキーマ同期
docker compose exec app npm run db:push

# Prisma Client生成
docker compose exec app npm run db:generate
```

## 📁 プロジェクト構造

```
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes（取得系）
│   ├── actions/              # Server Actions（更新系）
│   ├── layout.tsx           # ルートレイアウト
│   └── page.tsx             # ホームページ
├── components/              # Reactコンポーネント
│   ├── Layout/              # レイアウトコンポーネント
│   ├── forms/               # フォームコンポーネント
│   └── ui/                  # UIコンポーネント
├── lib/                     # ユーティリティ
│   ├── prisma.ts            # Prismaクライアント
│   └── theme.ts             # Mantineテーマ
├── tests/                   # テスト
│   ├── unit/                # ユニットテスト
│   └── e2e/                 # E2Eテスト
├── docker/                  # Docker設定
└── prisma/                  # データベーススキーマ
```

## 🧪 テスト

### ユニットテスト
```bash
# テスト実行
docker compose exec app npm run test

# ウォッチモード
docker compose exec app npm run test:watch

# カバレッジ
docker compose exec app npm run test:coverage
```

### E2Eテスト
```bash
# E2Eテスト実行
docker compose exec app npm run test:e2e

# UIモードでテスト実行
docker compose exec app npm run test:e2e:ui
```

## 🏗️ API設計

### 取得系（API Routes）
```typescript
// app/api/users/route.ts
export async function GET(request: NextRequest) {
  // ページネーション、検索機能付きユーザー一覧取得
}
```

### 更新系（Server Actions）
```typescript
// app/actions/users/create-user.ts
'use server';

export async function createUser(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // バリデーション、データベース更新、リバリデーション
}
```

## 🎨 UI コンポーネント

### フォーム
```tsx
<UserForm 
  mode="create" 
  onSuccess={() => router.push('/users')} 
/>
```

### データテーブル
```tsx
<DataTable
  data={users}
  columns={userColumns}
  pagination={pagination}
  onPageChange={setPage}
  actions={(user) => <UserActions user={user} />}
/>
```

## 🔒 環境変数

```env
# データベース
DATABASE_URL="mysql://next_user:next_password@localhost:3306/next_template"

# Next.js
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# 環境
NODE_ENV="development"
```

## 🚀 デプロイ

### Docker環境
```bash
# プロダクションビルド
docker compose -f docker-compose.prod.yml up -d
```

## 📖 開発ガイドライン

### データフローの原則
- **取得系操作**: API Routes使用 (`app/api/*/route.ts` → GETメソッド)
- **更新系操作**: Server Actions使用 (`app/actions/*.ts` → 'use server')

### アーキテクチャのコア設計
```typescript
// ✅ 取得系: API Route
// app/api/users/route.ts
export async function GET() { 
  const users = await prisma.user.findMany();
  return Response.json(users);
}

// ✅ 更新系: Server Action  
// app/actions/users/create-user.ts
'use server'
export async function createUser(formData: FormData) {
  const validatedFields = CreateUserSchema.parse({...});
  await prisma.user.create({ data: validatedFields });
  revalidatePath('/users');
}
```

### コーディング規約
- **TypeScript**: `strict`モード、`any`型は原則禁止
- **ファイル命名**: コンポーネントは`PascalCase.tsx`、その他は`kebab-case.ts`
- **インポート**: パスエイリアス（`@/components/*`等）を活用
- **環境変数**: `lib/env.ts`で型安全にバリデーション

### 品質基準
- **ビルド**: 0エラー・0警告
- **Lint**: 0ESLintエラー  
- **型チェック**: 0TypeScriptエラー
- **テスト**: E2E全テストケース通過

📚 **詳細ドキュメント**
- [Architecture.md](memory_bank/Architecture.md) - 詳細なアーキテクチャ解説
- [CLAUDE.md](CLAUDE.md) - 開発規約とプロセス

## 🤝 コントリビューション

1. フォークしてブランチ作成
2. 変更を加えてテスト実行
3. プルリクエスト作成

## 📝 ライセンス

MIT License
