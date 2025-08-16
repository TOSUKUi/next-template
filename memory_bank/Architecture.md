# Next.js Template Architecture

このドキュメントは、`next-template`プロジェクトのアーキテクチャ、主要な技術選定について解説します。
開発プロセスや規約については、[EngineeringManual.md](EngineeringManual.md)を参照してください。

## 1. プロジェクト概要

このプロジェクトは、Next.js 15 (App Router), Mantine v8, Prisma, MariaDB を使用したモダンなWebアプリケーションのテンプレートです。開発環境はDockerでコンテナ化されており、再現性の高い環境を提供します。

主な特徴:
- **フルスタックTypeScript**: フロントエンドからバックエンド、データベース操作まで一貫して型安全な開発が可能です。
- **明確な責務分離**: データ取得（Read）とデータ更新（Create/Update/Delete）の処理を明確に分離するアーキテクチャを採用しています。
- **コンポーネントベース**: 再利用可能なUIコンポーネント群により、効率的なUI開発を実現します。
- **テスト**: ユニットテストとE2Eテストの両方をサポートし、品質を担保します。

## 2. 技術スタック

- **フレームワーク**: [Next.js 15](https://nextjs.org/) (App Router)
- **UIライブラリ**: [Mantine v8](https://mantine.dev/)
- **データベース**: [MariaDB 10.11](https://mariadb.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **バリデーション**: [Zod](https://zod.dev/)
- **テスト**: [Jest](https://jestjs.io/) (ユニットテスト), [Playwright](https://playwright.dev/) (E2Eテスト)
- **コンテナ**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **言語**: [TypeScript](https://www.typescriptlang.org/)

## 3. ディレクトリ構成

プロジェクトの主要なディレクトリとその役割は以下の通りです。

```
/
├── app/                      # Next.js App Router
│   ├── api/                  # (データ取得) API Routes
│   │   ├── health/           # ヘルスチェックAPI
│   │   ├── products/         # 商品データ取得API
│   │   └── users/            # ユーザーデータ取得API
│   ├── actions/              # (データ更新) Server Actions
│   │   ├── products/         # 商品のCUDアクション
│   │   └── users/            # ユーザーのCUDアクション
│   ├── layout.tsx            # ルートレイアウト
│   └── page.tsx              # ホームページ
├── components/               # Reactコンポーネント
│   ├── Layout/               # レイアウトコンポーネント (e.g., MainLayout)
│   ├── forms/                # フォームコンポーネント (e.g., UserForm, ProductForm)
│   └── ui/                   # 汎用UIコンポーネント (e.g., DataTable, DeleteModal)
├── lib/                      # ライブラリ、ユーティリティ
│   ├── prisma.ts             # Prismaクライアントのインスタンス
│   └── theme.ts              # Mantineのテーマ設定
├── prisma/                   # Prisma関連
│   └── schema.prisma         # データベースのスキーマ定義
├── tests/                    # テストコード
│   ├── e2e/                  # PlaywrightによるE2Eテスト
│   └── unit/                 # Jestによるユニットテスト
├── docker/                   # Docker関連の設定
│   └── mariadb/
│       └── init/
│           └── init.sql      # DB初期化用SQL
├── .github/                  # (推奨) GitHub Actionsのワークフロー
├── docker-compose.development.yml # 開発用のDocker Compose設定
├── next.config.ts            # Next.jsの設定ファイル
├── package.json              # プロジェクトの依存関係とスクリプト
└── tsconfig.json             # TypeScriptの設定ファイル
```

## 4. アーキテクチャの核心: データフロー

本プロジェクトの最も重要な設計思想は、**データ取得（Read）**と**データ更新（Mutation）**の責務を明確に分離することです。

### 4.1. データ取得 (Read)

- **責務**: データベースからデータを読み取り、UIに表示すること。
- **使用技術**: **API Routes**
- **フロー**:
    1. Reactコンポーネント (主にクライアントコンポーネント) が `fetch` を使用して `app/api/**` のエンドポイントを呼び出す。
    2. API Route (`app/api/**/*.ts`) はリクエストを受け取り、Prismaクライアントを通じてデータベースからデータを取得する。
    3. 取得したデータをJSON形式でレスポンスとして返す。
- **実装例**: `app/api/users/route.ts`

### 4.2. データ更新 (Create, Update, Delete)

- **責務**: ユーザーの操作に基づき、データベースの状態を変更すること。
- **使用技術**: **Server Actions**
- **フロー**:
    1. フォームコンポーネント (`components/forms/*`) が、`'use server'` ディレクティブを持つ関数 (`app/actions/**/*.ts`) を `action` として指定する。
    2. フォームが送信されると、Server Actionがサーバーサイドで直接実行される。
    3. Zodを用いて入力値をバリデーションする。
    4. Prismaクライアントを通じて、データベースの作成・更新・削除処理を行う。
    5. `revalidatePath` を呼び出して、関連するページのキャッシュを破棄し、UIを最新の状態に更新する。
- **実装例**: `app/actions/users/create-user.ts`

この分離により、データ取得ロジックと更新ロジックが混在することを防ぎ、見通しが良くメンテナンス性の高いコードベースを維持します。

## 5. 状態管理

- **フォームの状態**: `useActionState` フックを利用して、Server Actionの実行状態（`pending`）、成功結果、バリデーションエラーを管理します。これにより、サーバーからのフィードバックをUIに簡単に反映できます。
- **グローバルな状態**: 現状、複雑なグローバル状態管理ライブラリ（Redux, Zustandなど）は導入していません。Next.jsのキャッシュとServer Componentsを最大限に活用し、状態管理の必要性を最小限に抑える設計を推奨します。

## 6. テスト戦略

- **ユニットテスト (Jest)**:
    - Server ActionsやAPI Routesのビジネスロジックを中心にテストします。
    - Prismaクライアントは `jest.mock` を用いてモック化し、データベースに依存しない純粋なロジックのテストを行います。
    - **対象**: `app/actions/**/*.ts`, `app/api/**/*.ts`
- **E2Eテスト (Playwright)**:
    - ユーザーの操作フロー全体をテストします。
    - 実際のブラウザ（Chromium, Firefox, WebKit）を起動し、ページ遷移、フォーム入力、ボタンクリック、結果の表示などを検証します。
    - 開発サーバー (`npm run dev`) を起動した状態でテストを実行します。
    - **対象**: 主要なページ (`/`, `/users` など) と、ユーザーのインタラクション。

## 7. 開発環境 (Docker)

`docker-compose.development.yml` に定義されたサービス群で開発環境を構築します。
- `app`: Next.jsアプリケーション
- `mariadb`: MariaDBデータベース
- `redis`: (オプション) キャッシュ用Redis

開発者は `docker compose exec app <command>` のように、コンテナ内で全てのコマンドを実行することが規約として定められています。これにより、開発者間の環境差異をなくします。

## 8. コーディング規約

- **ESLint & Prettier**: コードスタイルはこれらのツールによって自動的にフォーマット・チェックされます。
- **TypeScript**: `strict`モードを有効にし、`any`型は原則として使用しません。
- **ファイル命名**:
    - コンポーネント: `PascalCase.tsx` (例: `UserForm.tsx`)
    - その他: `kebab-case.ts` (例: `create-user.ts`)
