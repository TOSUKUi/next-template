"use client";

import { useActionState } from "react";
import {
  Box,
  Button,
  TextInput,
  Select,
  Stack,
  Alert,
  Paper,
  Title,
  Group,
} from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import {
  createUser,
  CreateUserFormState,
} from "@/app/actions/users/create-user";
import {
  updateUser,
  UpdateUserFormState,
} from "@/app/actions/users/update-user";

interface UserFormProps {
  mode: "create" | "update";
  initialData?: {
    id?: string;
    name?: string;
    email?: string;
    role?: "user" | "admin";
  };
  onSuccess?: () => void;
}

export default function UserForm({
  mode,
  initialData,
  onSuccess,
}: UserFormProps) {
  const [state, formAction, pending] = useActionState<
    CreateUserFormState | UpdateUserFormState
  >(mode === "create" ? createUser : updateUser, { success: false });

  const handleSubmit = async (formData: FormData) => {
    if (mode === "update" && initialData?.id) {
      formData.append("id", initialData.id);
    }
    await formAction(formData);
    if (state.success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <Paper p="md" withBorder>
      <Title order={3} mb="md">
        {mode === "create" ? "ユーザー作成" : "ユーザー更新"}
      </Title>

      {state.success && (
        <Alert
          icon={<IconCheck size="1rem" />}
          color="green"
          mb="md"
          onClose={() => {}}
        >
          {state.message}
        </Alert>
      )}

      {state.errors?._form && (
        <Alert icon={<IconAlertCircle size="1rem" />} color="red" mb="md">
          {state.errors._form[0]}
        </Alert>
      )}

      <form action={handleSubmit}>
        <Stack>
          <TextInput
            label="名前"
            name="name"
            defaultValue={initialData?.name}
            error={state.errors?.name?.[0]}
            required
          />

          <TextInput
            label="メールアドレス"
            name="email"
            type="email"
            defaultValue={initialData?.email}
            error={state.errors?.email?.[0]}
            required
          />

          {mode === "create" && (
            <TextInput
              label="パスワード"
              name="password"
              type="password"
              error={state.errors?.password?.[0]}
              required
            />
          )}

          <Select
            label="ロール"
            name="role"
            data={[
              { value: "user", label: "ユーザー" },
              { value: "admin", label: "管理者" },
            ]}
            defaultValue={initialData?.role || "user"}
            error={state.errors?.role?.[0]}
            required
          />

          <Group justify="flex-end">
            <Button type="submit" loading={pending}>
              {mode === "create" ? "作成" : "更新"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
