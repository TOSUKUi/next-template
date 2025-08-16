# Mantine × Next.js（App Router/RSC）開発指針

## 結論
**どちらも正しい回避策で、使い分けの軸は「RSCのメリットをどこまで維持したいか」「どれだけ多くの子コンポーネントをクライアント化したくないか」**

### 推奨順位
1. **ComponentXXX版に置き換える**（`Popover.Target` → `PopoverTarget`）
   - クライアント境界を広げずにエラーを回避
   - RSCの恩恵を最大限維持
2. **`'use client'`を付けてクライアント化**
   - 該当ファイルでクライアント側の状態/イベントを多用する場合
   - 複合コンポーネントを大量に使う場合

### 背景
- **Mantine**: 全コンポーネントがuseContextを使うため「サーバーコンポーネント化できない＝クライアントコンポーネント」
- **App Router**: サーバーツリーの中に「クライアント穴」を挿すのは可能（RSCの基本思想）
- **複合コンポーネント問題**: `Component.XXX`形式はRSCのクライアントマニフェスト解決と相性が悪い

### 使い分けガイド

#### ComponentXXXを優先するケース
- サーバーファイル（layout.tsx/page.tsx）内で、Mantineの複合コンポーネントの一部だけ使いたい
- 同ファイルにuseState/useEffectなどクライアント専用のロジックが不要
- RSCによりデータ取得やSSRの効率を維持したい

#### `'use client'`を付けるケース
- 同ファイルでブラウザAPI、イベント、多数のインタラクションが必要
- 複合コンポーネントを大量に使い、ComponentXXXへ書き換えるコストが高い
- そのファイル全体をクライアントに寄せることによる影響（バンドル増/遅延）が許容範囲

### 実装パターン（安全策）

```typescript
// ✅ サーバーファイルでの複合コンポーネント
// 方法1: ComponentXXX構文
<PopoverTarget>
<PopoverDropdown>

// 方法2: 'use client'追加
'use client';
<Popover.Target>
<Popover.Dropdown>

// ✅ RootLayoutはサーバーのまま、ClientProvidersで境界分離
// layout.tsx (Server Component)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClientProviders>  {/* 'use client' */}
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

// ClientProviders.tsx
'use client';
export function ClientProviders({ children }) {
  return (
    <MantineProvider>
      <Notifications />
      {children}
    </MantineProvider>
  );
}
```

### 推奨戦略
1. **RSCの利点を最大化**: サーバーファイル内では`ComponentXXX`置換を優先
2. **`'use client'`は最小限**: インタラクションが濃い場合のみ適用
3. **境界を明確化**: 「サーバー境界は上位、クライアント境界は必要箇所に小さく」

### 重要なルール
- **Mantineコンポーネント使用時**: ファイル冒頭に`'use client';`必須（ただし例外あり）
- **複合コンポーネント**: Server Componentでは`ComponentXXX`構文を使用
- **境界設計**: 重いデータ取得や大きな非UIロジックはサーバーへ寄せる
