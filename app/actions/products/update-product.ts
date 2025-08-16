"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const UpdateProductSchema = z.object({
  id: z.string().cuid(),
  name: z
    .string()
    .min(1, "商品名は必須です")
    .max(255, "商品名は255文字以内で入力してください"),
  description: z
    .string()
    .max(1000, "説明は1000文字以内で入力してください")
    .optional(),
  price: z.coerce.number().min(0, "価格は0以上で入力してください"),
  stock: z.coerce
    .number()
    .int()
    .min(0, "在庫数は0以上の整数で入力してください"),
  category: z
    .string()
    .max(100, "カテゴリは100文字以内で入力してください")
    .optional(),
  image: z.string().url("有効なURLを入力してください").optional(),
});

export type UpdateProductFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    description?: string[];
    price?: string[];
    stock?: string[];
    category?: string[];
    image?: string[];
    _form?: string[];
  };
};

export async function updateProduct(
  prevState: UpdateProductFormState,
  formData: FormData,
): Promise<UpdateProductFormState> {
  const validatedFields = UpdateProductSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    category: formData.get("category"),
    image: formData.get("image"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, description, price, stock, category, image } =
    validatedFields.data;

  try {
    // 商品存在チェック
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!existingProduct) {
      return {
        errors: {
          _form: ["商品が見つかりません"],
        },
      };
    }

    // 商品更新
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
        category,
        image,
      },
      select: {
        id: true,
        name: true,
        price: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath(`/products/${id}`);
    revalidatePath(`/users/${existingProduct.userId}`);

    return {
      success: true,
      message: `商品「${updatedProduct.name}」を更新しました`,
    };
  } catch (error) {
    console.error("Error updating product:", error);

    return {
      errors: {
        _form: ["商品の更新に失敗しました。もう一度お試しください。"],
      },
    };
  }
}
