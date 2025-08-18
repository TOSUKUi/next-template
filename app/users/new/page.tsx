import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import MainLayout from "@/components/Layout/MainLayout";
import UserForm from "@/components/forms/UserForm";

export default function NewUserPage() {
  return (
    <MainLayout>
      <Stack>
        <Group>
          <Button
            component={Link}
            href="/users"
            variant="subtle"
            leftSection={<IconArrowLeft size="1rem" />}
          >
            ユーザー一覧に戻る
          </Button>
        </Group>

        <div>
          <Title order={1}>新規ユーザー作成</Title>
          <Text c="dimmed">新しいユーザーを登録します</Text>
        </div>

        <Card shadow="sm" padding="md" radius="md" withBorder>
          <UserForm mode="create" />
        </Card>
      </Stack>
    </MainLayout>
  );
}