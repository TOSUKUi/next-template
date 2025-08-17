"use client";

import { Table, Badge, Group, Button, Text, Pagination } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    posts: number;
    products: number;
  };
}

interface UserTableProps {
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

export default function UserTable({ users, pagination }: UserTableProps) {
  const router = useRouter();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "red";
      case "USER":
        return "blue";
      default:
        return "gray";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePageChange = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("page", page.toString());
    router.push(`/users?${searchParams.toString()}`);
  };

  return (
    <>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>名前</Table.Th>
            <Table.Th>メールアドレス</Table.Th>
            <Table.Th>ロール</Table.Th>
            <Table.Th>投稿数</Table.Th>
            <Table.Th>商品数</Table.Th>
            <Table.Th>登録日</Table.Th>
            <Table.Th>操作</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((user) => (
            <Table.Tr key={user.id}>
              <Table.Td>
                <Text fw={500}>{user.name}</Text>
              </Table.Td>
              <Table.Td>{user.email}</Table.Td>
              <Table.Td>
                <Badge color={getRoleBadgeColor(user.role)} size="sm">
                  {user.role === "ADMIN" ? "管理者" : "一般ユーザー"}
                </Badge>
              </Table.Td>
              <Table.Td>{user._count.posts}</Table.Td>
              <Table.Td>{user._count.products}</Table.Td>
              <Table.Td>{formatDate(user.createdAt)}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconEdit size="0.8rem" />}
                  >
                    編集
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    leftSection={<IconTrash size="0.8rem" />}
                  >
                    削除
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {users.length === 0 && (
        <Text ta="center" c="dimmed" py="xl">
          検索条件に一致するユーザーが見つかりませんでした
        </Text>
      )}

      {pagination.totalPages > 1 && (
        <Group justify="center" mt="md">
          <Pagination
            value={pagination.page}
            onChange={handlePageChange}
            total={pagination.totalPages}
          />
        </Group>
      )}
    </>
  );
}