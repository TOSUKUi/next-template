import { Loader, Container, Center, Stack, Text } from '@mantine/core';

export default function Loading() {
  return (
    <Container size="sm" py="xl">
      <Center>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">読み込み中...</Text>
        </Stack>
      </Center>
    </Container>
  );
}