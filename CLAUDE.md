---
description: Next.jsプロジェクト開発ドキュメント
globs:
alwaysApply: true
---

# Next.js プロジェクト開発ドキュメント

このプロジェクトにおける開発の進め方、アーキテクチャ、各種規約についてまとめたドキュメントです。

## 📖 主要ドキュメント

プロジェクトに関する主要なドキュメントは以下の通りです。

- **[Engineering Manual](memory_bank/EngineeringManual.md)** ⚠️ **必読**
  - 開発環境、コーディング規約、テスト方針、CI/CDなど、開発プロセス全般のルールを定義しています。
  - **このプロジェクトで作業する際は必ず最初に読んでください。**

- **[Architecture Guide](memory_bank/Architecture.md)**
  - ディレクトリ構成、コンポーネント設計、状態管理、データ取得など、アプリケーションの設計思想について解説しています。

- **[Mantine UI Guide](memory_bank/MantineGuide.md)**
  - 本プロジェクトで採用しているUIフレームワーク`Mantine`の利用方法、特にNext.jsのApp Router/RSC環境での使い分けについて詳しく説明しています。

# 🚨 CRITICAL: Progress File Management
**TodoWriteツールを使用する場合は必ず進捗ファイルを作成**:
1. TodoWriteツール実行前に`memory_bank/progresses/YYYYMMDDHHMMSS-<タスク名>.md`を作成
2. 複数ファイル編集が予想される場合は事前に進捗ファイル作成
3. 進捗ファイルなしでTodoWriteツールを使用することは禁止
4. 詳細は[Engineering Manual](memory_bank/EngineeringManual.md)の「🚨 進捗ファイル作成必須ルール」を参照
