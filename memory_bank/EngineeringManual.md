はい、承知いたしました。
ご指摘の通り、テストの責務分離に「遊び（解釈の余地）」をなくし、**決定論的なガイドライン**を設けることは、エージェントの動作を安定させる上で極めて重要です。

これまでの対話で洗練された要素を全て継承しつつ、テストレベルの選定に一切の曖昧さを排除するための具体的な\*\*判断基準（Decision Matrix）\*\*を導入します。これにより、エージェントはどのロジックをどのテストで書くべきか、機械的に判断できるようになります。

以下が、最終的にリファクタリングされた指示書です。

-----

### **LLM AGENT: MASTER DIRECTIVES & PROJECT CONTEXT (V4 - Final)**

#### **0. META-INSTRUCTION (最上位指示)**

  - **憲法 (Constitution)**: このドキュメントは、あなたの行動と意思決定における**絶対的な憲法**である。全てのタスクは、この指示書に厳密に従って遂行せよ。判断に迷った際は、必ずこのドキュメントに立ち返ること。

-----

#### **1. CORE PRINCIPLES (最重要原則)**

  - **Execution Environment**: **Docker Only**. 全てのコマンドは `docker compose exec app` 経由で実行せよ。
  - **Data Handling**: **Read (GET)はAPI Routes**、**Write (CUD)はServer Actions**。この分担を厳守すること。
  - **Component Strategy**: **Minimize Client Components**。
      - **RATIONALE**: RSCの利点（パフォーマンス, SEO）を最大化するため。
      - **RULE**: `page.tsx` はServer Componentを維持し、`'use client'` はインタラクティブな末端UIに限定せよ。

-----

#### **2. TESTING STRATEGY (テスト戦略)**

##### **2.1. Methodology**

  - **[MUST]** **t-wada氏の提唱するテスト駆動開発 (TDD)** の原則に従うこと。
      - **Cycle**: `Red` → `Green` → `Refactor` のサイクルを機械的に遵守せよ。

##### **2.2. Test Level Selection Guideline (テストレベル選定ガイドライン)**

  - **[PRINCIPLE]** ある機能要件をテストする際、**以下の優先順位に従ってテストレベルを決定**すること。下位のレベルでテスト可能であれば、**決して上位のレベルでテストしてはならない**。

<!-- end list -->

1.  **Unit Test (Jest) を選択する基準:**

      - **条件**: テスト対象がUIを描画せず、かつ実際のネットワーク通信を伴わない純粋なロジックか？
          - 例: データ変換、バリデーション、URL構築、Server ActionやAPI Routeの内部ロジック（`fetch`等はモック化）。
      - **[ACTION]**: **YESの場合、Unit Testで実装する。** これが最も優先されるべきテストレベルである。

2.  **Integration Test (RTL+MSW) を選択する基準:**

      - **条件**: Unit Testの基準を満たさず、かつコンポーネントのレンダリングや複数コンポーネント間の連携（Propsの受け渡し、状態変化）を検証する必要があるか？ API通信はMSWでモック化するか？
          - 例: Server ComponentとClient Componentの連携、フォームの入力とバリデーション表示、ローディング状態からデータ表示への遷移。
      - **[ACTION]**: **YESの場合、Integration Testで実装する。**

3.  **E2E Test (Playwright) を選択する基準:**

      - **条件**: 上記2つの基準を満たさず、実際のブラウザ環境で、複数のページ遷移をまたがるユーザーの操作フロー全体を検証する必要があるか？
          - 例: ログインしてから商品を検索し、カートに追加するフロー。認証・認可。
      - **[ACTION]**: **YESの場合、E2E Testで実装する。**

##### **2.3. Test Overlap Exclusion (テスト重複排除の原則)**

  - **[PRINCIPLE]** あるロジックは、原則として**1つのテストレベルでのみ詳細にテストする**。
      - **例**: `fetchUsers`関数のURL生成ロジックはUnit Testで詳細にテストする。Integration TestやE2E Testでは、`fetchUsers`が「呼ばれたこと」や「適切なデータを返したこと（MSW経由）」を確認するのみで、URL生成の全パターンを再テストしないこと。

-----

#### **3. DEVELOPMENT & QUALITY (開発プロセスと品質基準)**

  - **Core Commands**:
      - **Service**: `docker compose -f docker-compose.development.yml up -d` / `... down`
      - **Quality Check**: `... exec app npm run build` / `... lint` / `... npx tsc --noEmit`
      - **Test**: `... exec app npm run test` / `... run --rm playwright npx playwright test`
  - **Quality Gates**: **[MUST]** 上記のQuality CheckとTestコマンドが全てエラーなく成功すること。

-----

#### **4. AGENT WORKFLOW: AGILE TASK MANAGEMENT (エージェントの作業プロセス)**

  - **Rule**: 複雑なタスクに着手する際は、**必ず**進捗管理ファイル (`memory_bank/progresses/`) を作成せよ。
  - **Workflow**: `INIT` → `PLAN` → `EXECUTE & LOG` → `ITERATE` → `QA & COMPLETE` の反復サイクルでタスクを遂行せよ。

##### **Progress File Template**

```markdown
# タスク進捗管理: <タスク名>
## 1. 概要 (Summary)
| 項目 | 内容 |
|:---|:---|
| **タスク名** | <タスク名> |
| **ステータス** | In Progress / Blocked / Done |
| **ゴール** | (タスク完了時の達成状態) |

## 2. 要求と完了の定義 (Requirements & DoD)
### 2.1. 要求 (Requirements)
* **REQ-001**: <ユーザーストーリー or 要求>
### 2.2. 完了の定義 (Definition of Done - DoD)
* [ ] **DoD-01**: REQ-001が成果物に反映されている。
* [ ] **DoD-02**: コード変更は「2.2. Test Level Selection Guideline」に従ったテストでカバーされている。
* [ ] **DoD-03**: 全ての品質ゲートを通過する。

## 3. 計画 (Plan)
### 3.1. 成果物 (Deliverables)
* [ ] **DEL-01**: `path/to/file.ts` (関連: REQ-001)
### 3.2. 作業計画 (WBS)
* [ ] **WBS-01**: REQ-001のロジックを `DEL-01` に実装する。
* [ ] **WBS-02**: WBS-01のテストを実装する。

## 4. 実行ログ (Execution Log) - ※最重要セクション
(思考、コマンド、結果、エラー、決定を全て時系列で記録せよ)
### YYYY-MM-DD HH:MM:SS | WBS-01 開始
* **Action**:
* **Observation**:
* **Next Step**:

## 5. ナレッジ (Knowledge)
(タスク完了後の恒久的な知見)
```

-----

#### **5. PROTOCOLS & TOOLS (規約とツール)**

  - **Commits**: **Conventional Commits**
  - **Branches**: **GitHub Flow**
  - **Pull Requests**: **Self-review必須**, テンプレート使用, CIパス
  - **Web Search**: `gemini --prompt "WebSearch: <query>"` を使用
  - **Knowledge Base**: `memory_bank/`

-----

#### **6. TASK EXECUTION DIRECTIVES (タスク実行指示)**

##### **6.1. INVIOLABLE RULES (厳守事項)**

  - **[MUST NOT] テスト仕様の変更**: テストが検証する\*\*仕様（意図）\*\*は絶対に変更しないこと。
  - **[MAY] テスト実装のリファクタリング**: プロダクションコード修正後、**仕様を変更しない範囲で**テストコードの品質改善を提案・実行することを許可する（要ユーザー承認）。
  - **[MUST NOT]** テストをパスさせるためだけのハードコーディング。
  - **[MUST]** 汎用的なビジネスロジックの実装。

##### **6.2. ACTION PLAN (行動計画)**

1.  **Analyze**: 失敗しているテストを分析せよ。
2.  **Explain**: 失敗原因を日本語で簡潔に説明せよ。
3.  **Propose**: プロダクションコードへの最小限の修正を提案せよ。
4.  **Apply & Verify**: 修正を適用し、テストを再実行せよ。
5.  **Iterate**: 失敗が続く場合、1-4を繰り返せ (最大3回)。
6.  **Output**: プロダクションコードの `diff` のみを出力せよ。

##### **6.3. FINAL VERIFICATION CHECKLIST (最終確認)**

  - テストの**仕様**を変更したか？ (**MUST BE: NO**)
  - ハードコーディングや環境依存の値を導入したか？ (**MUST BE: NO**)
  - 全てのテストがパスしたか？ (**MUST BE: YES**)
