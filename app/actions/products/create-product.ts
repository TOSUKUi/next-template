"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const CreateProductSchema = z.object({
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
    .min(0, "在庫数は0以上の整数で入力してください")
    .default(0),
  category: z
    .string()
    .max(100, "カテゴリは100文字以内で入力してください")
    .optional(),
  image: z.string().url("有効なURLを入力してください").optional(),
  userId: z.string().cuid(),
});

export type CreateProductFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    description?: string[];
    price?: string[];
    stock?: string[];
    category?: string[];
    image?: string[];
    userId?: string[];
    _form?: string[];
  };
};

export async function createProduct(
  prevState: CreateProductFormState,
  formData: FormData,
): Promise<CreateProductFormState> {
  const validatedFields = CreateProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    category: formData.get("category"),
    image: formData.get("image"),
    userId: formData.get("userId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, description, price, stock, category, image, userId } =
    validatedFields.data;

  try {
    // ユーザー存在チェック
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      return {
        errors: {
          userId: ["指定されたユーザーが見つかりません"],
        },
      };
    }

    // 商品作成
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        category,
        image,
        userId,
      },
      select: {
        id: true,
        name: true,
        price: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath(`/users/${userId}`);

    return {
      success: true,
      message: `商品「${product.name}」を作成しました`,
    };
  } catch (error) {
    console.error("Error creating product:", error);

    return {
      errors: {
        _form: ["商品の作成に失敗しました。もう一度お試しください。"],
      },
    };
  }
}
