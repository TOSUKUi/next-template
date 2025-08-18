import { Alert, Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle, IconPlus } from "@tabler/icons-react";
import MainLayout from "@/components/Layout/MainLayout";
import UserSearchForm from "@/components/Users/UserSearchForm";
import UserTable from "@/components/Users/UserTable";
import { fetchUsers } from "@/lib/users";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { users, pagination, error } = await fetchUsers(resolvedSearchParams);

  return (
    <MainLayout>
      <Stack>
        <Group justify="space-between">
          <div>
            <Title order={1}>ユーザー管理</Title>
            <Text c="dimmed">登録されているユーザーの一覧と管理</Text>
          </div>
          <Button leftSection={<IconPlus size="1rem" />}>
            新規ユーザー追加
          </Button>
        </Group>

        <Card shadow="sm" padding="md" radius="md" withBorder>
          <UserSearchForm />

          {error && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="エラー"
              color="red"
              mb="md"
            >
              {error}
            </Alert>
          )}

          <UserTable users={users} pagination={pagination} />
        </Card>

        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Text size="sm" c="dimmed">
            合計: {pagination.total} ユーザー | ページ: {pagination.page} /{" "}
            {pagination.totalPages}
          </Text>
        </Card>
      </Stack>
    </MainLayout>
  );
}
