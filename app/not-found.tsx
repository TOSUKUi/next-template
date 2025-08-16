import { Button, Container, Stack, Text, Title } from "@mantine/core";
import { IconHome, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="lg">
        <Stack align="center" gap="sm">
          <Title order={1} size="4rem" c="dimmed">
            404
          </Title>
          <Title order={2} size="lg">
            ページが見つかりません
          </Title>
          <Text c="dimmed" ta="center">
            お探しのページは存在しないか、移動された可能性があります。
          </Text>
        </Stack>

        <Button
          component={Link}
          href="/"
          variant="light"
          leftSection={<IconHome size={16} />}
        >
          ホームに戻る
        </Button>
      </Stack>
    </Container>
  );
}
