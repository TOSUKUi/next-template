"use client";

import { Badge, Button, Group, Pagination, Table, Text } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DeleteModal from "@/components/ui/DeleteModal";
import { deleteUser } from "@/app/actions/users/delete-user";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
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
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpened(true);
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpened(false);
    setSelectedUser(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "red";
      case "user":
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
    <div data-testid="user-table">
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>名前</Table.Th>
            <Table.Th>メールアドレス</Table.Th>
            <Table.Th>ロール</Table.Th>
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
                  {user.role === "admin" ? "管理者" : "一般ユーザー"}
                </Badge>
              </Table.Td>
              <Table.Td>{formatDate(user.createdAt)}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconEdit size="0.8rem" />}
                    onClick={() => router.push(`/users/${user.id}`)}
                  >
                    編集
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    leftSection={<IconTrash size="0.8rem" />}
                    onClick={() => handleDeleteClick(user)}
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

      <DeleteModal
        opened={deleteModalOpened}
        onClose={handleDeleteModalClose}
        title="ユーザー削除"
        description="この操作は取り消すことができません。"
        action={deleteUser as any}
        itemId={selectedUser?.id || ""}
        itemName={selectedUser?.name || ""}
      />
    </div>
  );
}
