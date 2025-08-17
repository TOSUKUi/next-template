"use client";

import { Button, Group, Select, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function UserSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [role, setRole] = useState(searchParams.get("role") || "");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (role) params.set("role", role);

    router.push(`/users?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    setRole("");
    router.push("/users");
  };

  return (
    <Group mb="md">
      <TextInput
        placeholder="名前またはメールアドレスで検索"
        leftSection={<IconSearch size="1rem" />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        style={{ flex: 1 }}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <Select
        placeholder="ロールで絞り込み"
        data={[
          { value: "", label: "すべて" },
          { value: "ADMIN", label: "管理者" },
          { value: "USER", label: "一般ユーザー" },
        ]}
        value={role}
        onChange={(value) => setRole(value || "")}
        clearable
      />
      <Button onClick={handleSearch}>検索</Button>
      <Button variant="outline" onClick={handleReset}>
        リセット
      </Button>
    </Group>
  );
}
