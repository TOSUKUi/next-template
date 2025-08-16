import { Suspense } from "react";
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Button,
  Group,
} from "@mantine/core";
import Link from "next/link";

// 人工的に遅延させるコンポーネント
async function SlowComponent() {
  // 3秒待機してローディング状態を確認
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Title order={3} c="green">
        データ読み込み完了！
      </Title>
      <Text c="dimmed" mt="sm">
        3秒の遅延後に表示されるコンテンツです。
      </Text>
    </Card>
  );
}

export default function TestLoadingPage() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Loading UIテストページ</Title>
          <Text c="dimmed" mt="sm">
            このページでは、Next.js App
            Routerのloading.tsxの動作を確認できます。
          </Text>
        </div>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={2} mb="md">
            テスト方法
          </Title>
          <Stack gap="sm">
            <Text>1. 下の「ローディングテスト開始」ボタンをクリック</Text>
            <Text>2. 3秒間loading.tsxのUIが表示される</Text>
            <Text>3. その後、データが読み込まれて表示される</Text>
          </Stack>
        </Card>

        <Suspense fallback={<div>Suspenseローディング中...</div>}>
          <SlowComponent />
        </Suspense>

        <Group>
          <Button component={Link} href="/test-loading" variant="filled">
            ローディングテスト開始（ページリロード）
          </Button>
          <Button component={Link} href="/" variant="light">
            ホームに戻る
          </Button>
        </Group>

        <Card shadow="sm" padding="lg" radius="md" withBorder bg="blue.0">
          <Title order={3} c="blue">
            ℹ️ 技術詳細
          </Title>
          <Text size="sm" mt="sm">
            <strong>loading.tsx</strong>はNext.js App Routerの特殊ファイルで、
            ページコンポーネントがロードされる間に自動的に表示されます。 React
            Suspenseの境界として機能し、UXを向上させます。
          </Text>
        </Card>
      </Stack>
    </Container>
  );
}
