"use client";

import { useActionState } from "react";
import {
  Box,
  Button,
  TextInput,
  Textarea,
  NumberInput,
  Stack,
  Alert,
  Paper,
  Title,
  Group,
} from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import {
  createProduct,
  CreateProductFormState,
} from "@/app/actions/products/create-product";
import {
  updateProduct,
  UpdateProductFormState,
} from "@/app/actions/products/update-product";

interface ProductFormProps {
  mode: "create" | "update";
  userId: string;
  initialData?: {
    id?: string;
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    category?: string;
    image?: string;
  };
  onSuccess?: () => void;
}

export default function ProductForm({
  mode,
  userId,
  initialData,
  onSuccess,
}: ProductFormProps) {
  const [state, formAction, pending] = useActionState<
    CreateProductFormState | UpdateProductFormState
  >(mode === "create" ? createProduct : updateProduct, { success: false });

  const handleSubmit = async (formData: FormData) => {
    if (mode === "create") {
      formData.append("userId", userId);
    } else if (mode === "update" && initialData?.id) {
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
        {mode === "create" ? "商品作成" : "商品更新"}
      </Title>

      {state.success && (
        <Alert icon={<IconCheck size="1rem" />} color="green" mb="md">
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
            label="商品名"
            name="name"
            defaultValue={initialData?.name}
            error={state.errors?.name?.[0]}
            required
          />

          <Textarea
            label="説明"
            name="description"
            defaultValue={initialData?.description}
            error={state.errors?.description?.[0]}
            rows={4}
          />

          <NumberInput
            label="価格"
            name="price"
            defaultValue={initialData?.price}
            error={state.errors?.price?.[0]}
            min={0}
            step={0.01}
            decimalScale={2}
            required
          />

          <NumberInput
            label="在庫数"
            name="stock"
            defaultValue={initialData?.stock || 0}
            error={state.errors?.stock?.[0]}
            min={0}
            step={1}
          />

          <TextInput
            label="カテゴリ"
            name="category"
            defaultValue={initialData?.category}
            error={state.errors?.category?.[0]}
          />

          <TextInput
            label="画像URL"
            name="image"
            defaultValue={initialData?.image}
            error={state.errors?.image?.[0]}
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
