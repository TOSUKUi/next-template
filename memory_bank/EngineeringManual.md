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

### 🔺 テストピラミッド戦略
**責務を明確に分離し、効率的なテスト設計を実現する**

```
     E2E テスト（少数・遅い・本物に近い）
    ──────────────────────────────────
   統合・コンポーネントテスト（中程度）
  ──────────────────────────────────────
 ユニットテスト（多数・高速・純粋関数）
──────────────────────────────────────────
```

#### ユニットテスト（Jest）の責務
**純粋関数・ビジネスロジック・API処理に特化**

✅ **対象**:
- `fetchUsers`, `createUser` 等のデータ取得関数
- Server Actions（`createUser`, `updateUser`, `deleteUser`）
- API Routes（`/api/users`, `/api/health`）
- バリデーション・変換ロジック
- 単純なコンポーネント（props → 表示の検証）

✅ **具体例**:
```typescript
// URL組み立て・エラーハンドリング
test.each([
  [{}, 'http://localhost:3000/api/users?page=1&limit=10'],
  [{ search: 'foo', role: 'admin' }, 'http://localhost:3000/api/users?page=1&limit=10&search=foo&role=admin'],
])('builds correct URL for %j', async (params, expected) => {
  // fetchが正しいURLで呼ばれることを検証
})

test('handles network errors gracefully', async () => {
  fetch.mockRejectedValue(new Error('Network Error'))
  const result = await fetchUsers({})
  expect(result.error).toBe('ユーザー一覧の取得に失敗しました')
})
```

❌ **対象外**:
- Server Componentの非同期レンダリング
- Client ComponentのuseEffect・useState連携
- 実際のネットワーク通信
- UI操作の結果としてのAPI呼び出し

#### 統合・コンポーネントテスト（React Testing Library + MSW）
**コンポーネント間の連携・データフローに特化**

✅ **対象**:
- Server Component + Client Componentの連携
- MSWでAPIレスポンスをスタブ
- ローディング状態 → データ表示の流れ
- フォーム送信 → バリデーションエラー表示

✅ **具体例**:
```typescript
test('displays users after loading', async () => {
  // MSWでAPIレスポンスを定義
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res(ctx.json({ users: mockUsers, pagination: {...} }))
    })
  )

  render(<UsersPage searchParams={{}} />)
  expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  await waitFor(() => {
    expect(screen.getByText('Test User 1')).toBeInTheDocument()
  })
})
```

#### E2Eテスト（Playwright）の責務
**ユーザー視点の振る舞い・実際のワークフローに特化**

✅ **対象**:
- ページ全体の統合動作
- 検索フォーム入力 → URL更新 → 一覧フィルタ
- ページネーション操作
- 認証・認可の動作
- エラー時のトースト・リダイレクト
- 実際のサーバーとの通信

#### 🎯 Playwright 2025年ベストプラクティス

##### セレクター戦略（優先順位順）
1. **getByRole()** - インタラクティブ要素に最適
2. **getByTestId()** - 複雑な場合の確実な識別
3. **getByText()** - 非インタラクティブ要素のみ
4. **locator()** - CSS/XPath - 最後の手段

##### 厳密モード対応
**❌ 避けるべきパターン:**
```typescript
// 曖昧なセレクター（複数要素にマッチする可能性）
await page.getByText('検索').click()
await page.getByText('Delete').first().click() // first()は脆弱

// 非推奨：インタラクティブ要素にgetByText使用
await page.getByText('Submit').click()
```

**✅ 推奨パターン:**
```typescript
// Role-based selectors（推奨）
await page.getByRole('button', { name: '検索' }).click()
await page.getByRole('textbox', { name: 'ユーザー名' }).fill('admin')

// Container + Role（特定性向上）
await page
  .getByTestId('user-search-form')
  .getByRole('button', { name: '検索' })
  .click()

// Filter chains（複雑な条件）
await page
  .getByRole('row', { name: /John Doe/ })
  .getByRole('button', { name: 'Delete' })
  .click()
```

##### エラーパターンと対策
```typescript
// エラー例：厳密モード違反
// Error: strict mode violation: getByText('検索') resolved to 2 elements

// 解決方法1：Role-based
await page.getByRole('button', { name: '検索' }).click()

// 解決方法2：コンテナ指定
await page
  .locator('[data-testid="search-form"]')
  .getByRole('button', { name: '検索' })
  .click()

// 解決方法3：Exact matching
await page.getByText('検索', { exact: true }).click()
```

✅ **具体例（改善版）**:
```typescript
test('search functionality works end-to-end', async ({ page }) => {
  await page.goto('/users')

  // Role-based selectors使用
  await page.getByRole('textbox', { name: '名前またはメールアドレスで検索' }).fill('admin')
  await page.getByRole('button', { name: '検索' }).click()

  await expect(page).toHaveURL('/users?search=admin')
  await expect(page.getByRole('table')).toContainText('admin@example.com')
})
```

#### テスト重複の排除指針
1. **fetchUsers関数**: ユニットテストでURL生成・エラーハンドリングのみ
2. **UI表示**: E2Eテストで実際のユーザー操作・画面遷移
3. **Server Component**: 統合テストでMSW使用、またはE2Eに委譲
4. **認証・認可**: E2Eテストで実際のセッション・権限チェック

#### test.eachの活用
```typescript
const urlBuildingCases = [
  [{}, 'page=1&limit=10'],
  [{ page: '2', limit: '5' }, 'page=2&limit=5'],
  [{ search: 'test', role: 'admin' }, 'page=1&limit=10&search=test&role=admin'],
] as const

test.each(urlBuildingCases)('builds URL correctly for %j', async (params, expectedQuery) => {
  await fetchUsers(params, { baseUrl: 'http://test' })
  expect(fetch).toHaveBeenCalledWith(`http://test/api/users?${expectedQuery}`, expect.any(Object))
})
```

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

### 🚨 進捗ファイル作成必須ルール

**タスク開始時は必ず以下を実行（例外なし）**:
1. **TodoWriteツール使用時**: 進捗管理ファイル(`memory_bank/progresses/YYYYMMDDHHMMSS-<タスク名>.md`)を必ず作成
2. **複数ファイル編集予定時**: タスク開始前に進捗ファイル作成
3. **新機能実装時**: 機能の規模に関わらず進捗ファイル作成

**LLMは以下の場合、必ず進捗ファイルを作成してからタスク開始**:
- TodoWriteツールを使用した時点
- ユーザーからCRUD機能実装等の依頼を受けた時点
- 複数のファイルを作成・編集する予定がある時点

### 複雑なタスク向けプロセス
以下に該当する場合、進捗管理ファイル(`memory_bank/progresses/YYYYMMDDHHMMSS-<タスク名>.md`)を作成:

**適用基準**:
- 3つ以上のファイル編集
- 新技術導入・技術決定を伴う
- 外部提出用成果物作成
- **TodoWriteツールを使用した全てのタスク**

**基本フロー**:
1. **初期化**: 進捗管理ファイル作成、概要合意
2. **要求定義**: 要求をREQ-001形式でリスト化
3. **計画**: 成果物(PBS-XX)・作業(WBS-XX.Y)に分解
4. **実行**: WBSチェックリストに従い実施
5. **品質保証**: PBS評価観点で検証
6. **完了**: 成果物納品、ナレッジ蓄積

**適用除外**:
- 単一ファイル軽微修正（1行程度の変更）
- 定型設定変更（設定値のみの変更）
- 緊急対応（ただし事後に進捗ファイル作成推奨）
- 実験コード（ただし本格実装時は必須）

### TodoWrite連動
**進捗管理ファイル使用時は、TodoWriteツールでWBSタスクを管理し、状況変化に応じて進捗ファイルを同期更新すること**

#### 自動化hookの導入
**TodoWriteツール実行時の自動進捗ファイル更新**:
- `settings.json`に以下のhook設定を追加することで、TodoWrite実行時に自動的に進捗ファイルを更新
- LLMがTodoWriteを実行するたびに、対応する進捗ファイルのログセクションが自動更新される

```json
{
  "hooks": {
    "TodoWrite": {
      "command": "echo '[$(date \"+%Y-%m-%d %H:%M:%S\")] TodoWrite更新: 進捗ファイルを確認・更新してください' >> memory_bank/progresses/latest_progress.log",
      "description": "TodoWrite実行時に進捗ログを自動記録"
    }
  }
}
```

#### 更新タイミング
- **自動**: TodoWriteツール実行時（hook経由）
- **手動**: タスクステータス変更時 (pending → in_progress → completed)
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
- **TodoWrite更新**: [自動記録されたタイムスタンプ]
```

#### 進捗ファイル自動作成コマンド例
```bash
# 進捗ファイル作成用のヘルパースクリプト
create_progress_file() {
  TIMESTAMP=$(date "+%Y%m%d%H%M%S")
  TASK_NAME="$1"
  PROGRESS_FILE="memory_bank/progresses/${TIMESTAMP}-${TASK_NAME}.md"

  cat > "$PROGRESS_FILE" << 'EOF'
# 進捗管理: [タスク名]

## 1. 概要
- **開始日時**: $(date "+%Y-%m-%d %H:%M:%S")
- **タスク概要**: [概要を記載]

## 5. 調査ログ / 実行ログ
### 5.1. [開始時刻] プロジェクト開始
- **初期状態**: 進捗ファイル作成完了
- **次のアクション**: TodoWriteでタスク分解
EOF

  echo "進捗ファイル作成完了: $PROGRESS_FILE"
}
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


# ❗️STRICT RULES – do NOT ignore
You must NOT modify any test files or fixture data.
You must NOT hard-code values that only satisfy the current tests.
You must implement the real business logic that works for general inputs.

# TASK
1. Analyse the failing test(s) in ./test/**/*.*
2. Explain, in plain Japanese, why they fail (don’t change tests).
3. Propose the minimal change to the production code to make them pass.
4. Apply the change and run the test suite again.
5. If tests still fail, iterate steps 1-4 (max 3 iterations).
6. Output a diff of files you changed, excluding test files.

# CHECKLIST (answer YES/NO before finishing)
- Did you touch anything under ./test or ./spec? (Must be NO)
- Did you introduce hard-coded IDs, magic numbers, or environment-specific paths? (Must be NO)
- Do all tests pass after your code change? (Must be YES)
