import { Alert, Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle, IconPlus } from "@tabler/icons-react";
import MainLayout from "@/components/Layout/MainLayout";
import UserSearchForm from "@/components/Users/UserSearchForm";
import UserTable from "@/components/Users/UserTable";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UserResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

async function fetchUsers(searchParams: { [key: string]: string | undefined }) {
  try {
    const params = new URLSearchParams();

    // デフォルト値の設定
    params.set("page", searchParams.page || "1");
    params.set("limit", searchParams.limit || "10");

    // 検索パラメータの追加
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.role) params.set("role", searchParams.role);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/users?${params}`,
      {
        cache: "no-store", // Always get fresh data
      },
    );

    if (!response.ok) {
      throw new Error("ユーザー一覧の取得に失敗しました");
    }

    return (await response.json()) as UserResponse;
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      users: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      error: error instanceof Error ? error.message : "エラーが発生しました",
    };
  }
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const { users, pagination, error } = await fetchUsers(searchParams);

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
