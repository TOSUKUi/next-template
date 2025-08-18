"use client";

import { Card, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";

export function SlowComponent() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 3秒待機してローディング状態を確認
    const timeout = setTimeout(() => {
      setIsLoaded(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  if (!isLoaded) {
    // ローディング中の状態
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text>Suspenseローディング中...</Text>
      </Card>
    );
  }

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