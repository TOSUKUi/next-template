# Next.js プロジェクト エンジニアリングマニュアル

このマニュアルは、本プロジェクトにおける開発プロセス、テスト、品質基準、チーム連携などの規約を定めます。
プロジェクトの技術スタックや設計思想については、[Architecture.md](Architecture.md)を参照してください。

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

詳細は[Architecture.md](Architecture.md)の「データフロー」セクションを参照してください。

### Client Component最小化ルール
**RSCの恩恵を最大限活用するため、以下を厳守**

- **page.tsx は原則 Server Component を維持**
  - データフェッチはサーバー側で実行
  - 初期表示速度・SEO・バンドルサイズを最適化
- **Client化対象**: 検索フォーム、ボタンクリック等の最小限のUI部品のみ
- **データフェッチ**: Server Component で実行し、props で Client に渡す
- **状態管理**: Server Actions使用を優先、どうしても必要な場合のみ Client内で
- **アンチパターン**: page.tsx全体を `'use client'` 化（バンドル肥大化・RSC恩恵喪失）

### テスト駆動開発
1. 失敗するテストを先に作成
2. 最小限の実装でテスト通過
3. リファクタリング
4. t-wadaの教えに従う

## 🔧 開発環境

### 基本コマンド
```bash
# サービス起動/停止
docker compose -f docker-compose.development.yml up -d
docker compose -f docker-compose.development.yml down

# 開発コマンド
docker compose -f docker-compose.development.yml exec app npm run build
docker compose -f docker-compose.development.yml exec app npm run lint
docker compose -f docker-compose.development.yml exec app npx tsc --noEmit

# データベース
docker compose -f docker-compose.development.yml exec mariadb mysql -u next_user -p next_template
```

### テスト実行

#### ユニットテスト (Jest)
```bash
# 基本実行
docker compose -f docker-compose.development.yml exec app npm run test

# カバレッジ付き
docker compose -f docker-compose.development.yml exec app npm run test -- --coverage

# ウォッチモード
docker compose -f docker-compose.development.yml exec app npm run test:watch
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
docker compose -f docker-compose.development.yml run --rm playwright

# 個別実行
docker compose -f docker-compose.development.yml run --rm playwright npx playwright test tests/e2e/loading.spec.ts
docker compose -f docker-compose.development.yml run --rm playwright npx playwright test tests/e2e/home.spec.ts

# UIモード (ローカル開発時)
docker compose -f docker-compose.development.yml run --rm playwright npx playwright test --ui

# ヘッドレスモードで実行
docker compose -f docker-compose.development.yml run --rm playwright npx playwright test --headed

# レポート表示
docker compose -f docker-compose.development.yml run --rm playwright npx playwright show-report
```

**E2Eテスト構成**: 16テストケース
- 検索機能 (13テスト): フィルター、ソート、ページネーション等
- 管理画面 (3テスト): 認証、ナビゲーション

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

## 📋 タスク管理 再開に必要なコンテキストもここに入る ※必ずこのフローに従って行動計画、承認要求、実装を行うこと

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

### TodoWrite連動
**進捗管理ファイル使用時は、TodoWriteツールでWBSタスクを管理し、状況変化に応じて進捗ファイルを同期更新すること**

#### 更新タイミング
- タスクステータス変更時 (pending → in_progress → completed)
- 新たな問題・エラー発見時
- 解決策実行・検証完了時
- 最終成果物完成時

#### 更新箇所
```markdown
## 5. 調査ログ / 実行ログ
### 5.X. [日時] タスク進捗更新
- **WBS-XX.Y**: [タスク名] → [ステータス]
- **発見事項**: [新たに判明した問題・知見]
- **次のアクション**: [次に実行する具体的作業]
```

## 🔍 Web検索 (Gemini CLI)

**Web検索時は必ずgeminiを使用**
```bash
# Task Tool経由で実行
gemini --prompt "WebSearch: <query>"
```

技術情報検索時は2025年最新情報を取得し、バージョン情報を明記する。

## 🤝 チーム連携

### コミットメッセージ
**Conventional Commits規約に従う**
```
feat(search): 検索結果にページネーションを追加

検索結果が多い場合に備え、ページネーション機能を導入。
useSearchParamsを用いて現在のページ番号を管理し、
API側でoffset, limitを解釈する。

Fixes #123
```

### ブランチ戦略
**GitHub Flow**
1. `main`からブランチ作成 (`feat/機能名`, `fix/問題名`)
2. 実装・コミット
3. Pull Request作成
4. レビュー・CI実行
5. `main`へマージ

### プルリクエスト
- **セルフレビュー必須**: 提出前に必ず自身でコードレビュー
- **テンプレート使用**: PRテンプレートの全項目を埋める
- **CI成功**: 全てのCIチェックがグリーンであること

## 📚 ナレッジ管理

### 目的
- **属人化防止**: 暗黙知を形式知へ
- **生産性向上**: 過去の知見を再利用
- **品質安定**: ベストプラクティス共有

### 対象ナレッジ
- **技術選定理由**: なぜその技術を選んだか
- **アーキテクチャ設計**: なぜその構造にしたか
- **トラブルシューティング**: 発生した問題と解決策
- **Tips**: 開発効率を上げる小技

### 保存先
- **`memory_bank/`**: 恒久的なドキュメント
- **`CLAUDE.md`**: プロジェクト全体のポータル

### 運用ルール
- **ドキュメントはコード**: コードと同様にPRでレビュー
- **定期的な見直し**: 3ヶ月に1度、情報が古くなっていないか確認
- **検索しやすいように**: 重要なキーワードを含める
