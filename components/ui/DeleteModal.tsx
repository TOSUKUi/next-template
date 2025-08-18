"use client";

import { Alert, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { IconAlertCircle, IconTrash } from "@tabler/icons-react";
import { useActionState } from "react";

interface DeleteModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  description: string;
  action: (prevState: unknown, formData: FormData) => Promise<unknown>;
  itemId: string;
  itemName: string;
}

export default function DeleteModal({
  opened,
  onClose,
  title,
  description,
  action,
  itemId,
  itemName,
}: DeleteModalProps) {
  const [state, formAction, pending] = useActionState(action, {
    success: false,
  });

  const handleSubmit = async (formData: FormData) => {
    formData.append("id", itemId);
    await formAction(formData);
    if (state.success) {
      onClose();
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack>
        <Text size="sm" c="dimmed">
          {description}
        </Text>

        <Text fw={500}>「{itemName}」を削除しますか？</Text>

        {state.errors?._form && (
          <Alert icon={<IconAlertCircle size="1rem" />} color="red">
            {state.errors._form[0]}
          </Alert>
        )}

        <form action={handleSubmit}>
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose} disabled={pending}>
              キャンセル
            </Button>
            <Button
              type="submit"
              color="red"
              leftSection={<IconTrash size="1rem" />}
              loading={pending}
            >
              削除
            </Button>
          </Group>
        </form>
      </Stack>
    </Modal>
  );
}
