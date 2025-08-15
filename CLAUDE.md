---
description: Next.jsプロジェクト開発規約。Docker環境、データハンドリング方針、アーキテクチャ仕様を定義
globs:
alwaysApply: true
---

# Next.js プロジェクト開発規約

## 🚨 重要ルール（厳守）

### Docker必須
**全コマンドはdocker compose経由で実行**
```bash
# ❌ 直接実行
npm install

# ✅ 正しい実行
docker compose exec app npm install
```

### データハンドリング方針
**例外なく100%従うこと**

- **取得系操作**: API Route使用 (`app/api/*/route.ts` → GETメソッド)
- **更新系操作**: Server Actions使用 (`lib/actions/*.ts` → 'use server')

#### 実装パターン
```typescript
// ✅ 取得系: API Route
// app/api/products/route.ts
export async function GET() { ... }

// ✅ 更新系: Server Action
// lib/actions/products.ts
'use server'
export async function createProduct() { ... }

// ✅ クライアント呼び出し
fetch('/api/products')           // 取得系
useActionState(createProduct)    // 更新系
```

### テスト駆動開発
1. 失敗するテストを先に作成
2. 最小限の実装でテスト通過
3. リファクタリング
4. t-wadaの教えに従う

## 🔧 開発環境

### 基本コマンド
```bash
# サービス起動/停止
docker compose up -d
docker compose down

# 開発コマンド
docker compose exec app npm run build
docker compose exec app npm run lint
docker compose exec app npx tsc --noEmit

# データベース
docker compose exec mysql mysql -u sabakana -p sabakana
```

### テスト実行

#### ユニットテスト (Jest)
```bash
# 基本実行
docker compose exec app npm run test

# カバレッジ付き
docker compose exec app npm run test -- --coverage

# ウォッチモード
docker compose exec app npm run test:watch
```

**テスト構成**: 5スイート・47テストケース
- Admin Products API (7テスト)
- OCR Actions (11テスト)
- Products Actions (13テスト)
- Search API (11テスト)
- Health API (5テスト)

#### E2Eテスト (Playwright)
```bash
# 全テスト実行
docker compose run --rm app-playwright npx playwright test

# 個別実行
docker compose run --rm app-playwright npx playwright test tests/e2e/search.spec.ts
docker compose run --rm app-playwright npx playwright test tests/e2e/admin.spec.ts

# UIモード
docker compose run --rm app-playwright npx playwright test --ui
```

**E2Eテスト構成**: 16テストケース
- 検索機能 (13テスト): フィルター、ソート、ページネーション等
- 管理画面 (3テスト): 認証、ナビゲーション

## 🏗️ プロジェクト仕様

### 技術スタック
- **フロントエンド**: Next.js 15 (App Router) + Mantine v8
- **データベース**: MariaDB 10.11 + Prisma ORM
- **バリデーション**: Zod (型安全な環境変数含む)
- **テスト**: Jest + Playwright
- **その他**: Docker Compose

### アーキテクチャ

#### ディレクトリ構成
```
├── app/                   # Next.js App Router
│   ├── api/              # API Routes (取得系のみ)
│   ├── actions/          # Server Actions (更新系のみ)
│   ├── loading.tsx       # ローディングUI
│   ├── error.tsx         # エラーハンドリングUI
│   └── not-found.tsx     # 404ページ
├── components/            # Reactコンポーネント
│   ├── Layout/           # レイアウトコンポーネント
│   ├── forms/            # フォームコンポーネント
│   └── ui/               # UIコンポーネント
├── lib/                   # ライブラリ
│   ├── env.ts            # 型安全な環境変数
│   ├── prisma.ts         # Prismaクライアント
│   └── theme.ts          # Mantineテーマ
├── tests/                 # テストファイル
├── memory_bank/           # プロジェクト情報管理
│   ├── Architecture.md   # アーキテクチャ記録
│   └── progresses/       # 進捗管理ファイル
└── prisma/                # DBスキーマ
```

#### データフロー
```
取得系: [Component] → [API Route] → [Prisma] → [MariaDB]
更新系: [Form] → [Server Action] → [Prisma] → [MariaDB]
```

### サービス構成
- **app**: Next.jsアプリ (3000番ポート)
- **mariadb**: MariaDBデータベース (3306番ポート)
- **redis**: (オプション) キャッシュ (6379番ポート)

### 環境変数（型安全）
```bash
# lib/env.tsで型安全にバリデーション済み
DATABASE_URL=mysql://username:password@mariadb:3306/database_name
JWT_SECRET=your-secret-key-here
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔍 Web検索 (Gemini CLI)

**Web検索時は必ずgeminiを使用**
```bash
# Task Tool経由で実行
gemini --prompt "WebSearch: <query>"
```

技術情報検索時は2025年最新情報を取得し、バージョン情報を明記する。

## ✅ 品質基準

### 必須クリア項目
1. **ビルド**: `docker compose exec app npm run build` (0エラー・0警告)
2. **Lint**: `docker compose exec app npm run lint` (0エラー)
3. **型チェック**: `docker compose exec app npx tsc --noEmit` (0エラー)
4. **E2Eテスト**: 全16テストケース通過

### 画面チェック
```bash
# 基本アクセス確認
curl -f http://localhost:3000/
curl -f http://localhost:3000/search
curl -f http://localhost:3000/admin
```

## 📋 タスク管理

### 複雑なタスク向けプロセス
以下に該当する場合、進捗管理ファイル(`memory_bank/progresses/YYYYMMDDHHMMSS-<タスク名>.md`)を作成:

**適用基準**:
- 3つ以上のファイル編集
- 新技術導入・技術決定を伴う
- 外部提出用成果物作成

**基本フロー**:
1. **初期化**: 進捗管理ファイル作成、概要合意
2. **要求定義**: 要求をREQ-001形式でリスト化
3. **計画**: 成果物(PBS-XX)・作業(WBS-XX.Y)に分解
4. **実行**: WBSチェックリストに従い実施
5. **品質保証**: PBS評価観点で検証
6. **完了**: 成果物納品、ナレッジ蓄積

**適用除外**:
- 単一ファイル軽微修正
- 定型設定変更
- 緊急対応
- 実験コード
