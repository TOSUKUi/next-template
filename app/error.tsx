"use client";

import { Alert, Button, Container, Stack, Text } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="lg">
        <Alert
          variant="light"
          color="red"
          title="エラーが発生しました"
          icon={<IconAlertCircle size={16} />}
          w="100%"
        >
          <Text size="sm" mb="md">
            申し訳ございません。予期しないエラーが発生しました。
          </Text>
          {process.env.NODE_ENV === "development" && (
            <Text size="xs" c="dimmed" style={{ fontFamily: "monospace" }}>
              {error.message}
            </Text>
          )}
        </Alert>

        <Button
          variant="light"
          leftSection={<IconRefresh size={16} />}
          onClick={reset}
        >
          再試行
        </Button>
      </Stack>
    </Container>
  );
}
