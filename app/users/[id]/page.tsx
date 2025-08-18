import { Alert, Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import MainLayout from "@/components/Layout/MainLayout";
import UserForm from "@/components/forms/UserForm";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchUser(id: string): Promise<User | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/users/${id}`,
      {
        cache: "no-store", // Always get fresh data
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("ユーザー情報の取得に失敗しました");
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const user = await fetchUser(id);

    if (!user) {
      notFound();
    }

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
            <Title order={1}>ユーザー詳細</Title>
            <Text c="dimmed">ユーザー情報の表示・編集</Text>
          </div>

          <Card shadow="sm" padding="md" radius="md" withBorder>
            <UserForm
              mode="update"
              initialData={{
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role as "user" | "admin",
              }}
            />
          </Card>

          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                作成日時: {new Date(user.createdAt).toLocaleString("ja-JP")}
              </Text>
              <Text size="sm" c="dimmed">
                更新日時: {new Date(user.updatedAt).toLocaleString("ja-JP")}
              </Text>
            </Stack>
          </Card>
        </Stack>
      </MainLayout>
    );
  } catch (error) {
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

          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="エラー"
            color="red"
          >
            {error instanceof Error ? error.message : "エラーが発生しました"}
          </Alert>
        </Stack>
      </MainLayout>
    );
  }
}