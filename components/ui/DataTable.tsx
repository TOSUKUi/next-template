"use client";

import {
  ActionIcon,
  Button,
  Group,
  Menu,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { IconDotsVertical, IconSearch } from "@tabler/icons-react";
import { useState } from "react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T, value: unknown) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSearch?: (search: string) => void;
  actions?: (row: T) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pagination,
  onPageChange,
  onLimitChange,
  onSearch,
  actions,
  loading = false,
  emptyMessage = "データがありません",
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  const getValue = (row: T, key: keyof T | string): unknown => {
    if (typeof key === "string" && key.includes(".")) {
      return key.split(".").reduce((obj, prop) => obj?.[prop], row);
    }
    return row[key as keyof T];
  };

  return (
    <Stack>
      {onSearch && (
        <Group>
          <TextInput
            placeholder="検索..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
            leftSection={<IconSearch size="1rem" />}
          />
          <Button
            onClick={handleSearch}
            leftSection={<IconSearch size="1rem" />}
          >
            検索
          </Button>
        </Group>
      )}

      <Paper withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th key={String(column.key)} width={column.width}>
                  {column.label}
                </Table.Th>
              ))}
              {actions && <Table.Th width={80}>操作</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length + (actions ? 1 : 0)}>
                  <Text ta="center" py="lg">
                    読み込み中...
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : data.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length + (actions ? 1 : 0)}>
                  <Text ta="center" py="lg" c="dimmed">
                    {emptyMessage}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              data.map((row, index) => (
                <Table.Tr key={row.id || index}>
                  {columns.map((column) => {
                    const value = getValue(row, column.key);
                    return (
                      <Table.Td key={String(column.key)}>
                        {column.render
                          ? column.render(row, value)
                          : String(value || "-")}
                      </Table.Td>
                    );
                  })}
                  {actions && (
                    <Table.Td>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <IconDotsVertical size="1rem" />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>{actions(row)}</Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      {pagination && (
        <Group justify="space-between">
          <Group>
            <Text size="sm" c="dimmed">
              {pagination.total}件中{" "}
              {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}
              件を表示
            </Text>
            {onLimitChange && (
              <Select
                data={[
                  { value: "10", label: "10件" },
                  { value: "25", label: "25件" },
                  { value: "50", label: "50件" },
                  { value: "100", label: "100件" },
                ]}
                value={String(pagination.limit)}
                onChange={(value) => onLimitChange(parseInt(value || "10"))}
                size="sm"
                w={80}
              />
            )}
          </Group>

          {onPageChange && (
            <Pagination
              value={pagination.page}
              onChange={onPageChange}
              total={pagination.totalPages}
              size="sm"
            />
          )}
        </Group>
      )}
    </Stack>
  );
}
