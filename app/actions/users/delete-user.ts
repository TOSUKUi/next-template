"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";

const DeleteUserSchema = z.object({
  id: z.string().cuid(),
});

export type DeleteUserFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    _form?: string[];
  };
};

export async function deleteUser(
  prevState: DeleteUserFormState,
  formData: FormData,
): Promise<DeleteUserFormState> {
  const validatedFields = DeleteUserSchema.safeParse({
    id: formData.get("id"),
  });

  if (!validatedFields.success) {
    return {
      errors: {
        _form: ["無効なユーザーIDです"],
      },
    };
  }

  const { id } = validatedFields.data;

  try {
    // ユーザー存在チェック
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            posts: true,
            products: true,
          },
        },
      },
    });

    if (!user) {
      return {
        errors: {
          _form: ["ユーザーが見つかりません"],
        },
      };
    }

    // 関連データがある場合の警告
    if (user._count.posts > 0 || user._count.products > 0) {
      return {
        errors: {
          _form: [
            `このユーザーには関連データ（投稿: ${user._count.posts}件、商品: ${user._count.products}件）があるため削除できません。先に関連データを削除してください。`,
          ],
        },
      };
    }

    // ユーザー削除
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/users");
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `ユーザー「${user.name}」を削除しました`,
    };
  } catch (error) {
    console.error("Error deleting user:", error);

    return {
      errors: {
        _form: ["ユーザーの削除に失敗しました。もう一度お試しください。"],
      },
    };
  }
}
