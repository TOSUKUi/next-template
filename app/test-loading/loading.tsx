import { Loader, Container, Center, Stack, Text, Card } from '@mantine/core';

export default function Loading() {
  return (
    <Container size="sm" py="xl">
      <Card shadow="sm" padding="xl" radius="md" withBorder>
        <Center>
          <Stack align="center" gap="lg">
            <Loader size="xl" type="dots" />
            <Stack align="center" gap="xs">
              <Text size="lg" fw={500}>
                データを読み込み中...
              </Text>
              <Text c="dimmed" size="sm" ta="center">
                これは /app/test-loading/loading.tsx が表示されています
              </Text>
            </Stack>
          </Stack>
        </Center>
      </Card>
    </Container>
  );
}