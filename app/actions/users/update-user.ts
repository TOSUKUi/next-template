'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const UpdateUserSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, '名前は必須です').max(255, '名前は255文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください').max(255),
  role: z.enum(['user', 'admin']),
});

export type UpdateUserFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    role?: string[];
    _form?: string[];
  };
};

export async function updateUser(
  prevState: UpdateUserFormState,
  formData: FormData
): Promise<UpdateUserFormState> {
  const validatedFields = UpdateUserSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, email, role } = validatedFields.data;

  try {
    // ユーザー存在チェック
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return {
        errors: {
          _form: ['ユーザーが見つかりません'],
        },
      };
    }

    // メールアドレスの重複チェック（自分以外）
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return {
          errors: {
            email: ['このメールアドレスは既に使用されています'],
          },
        };
      }
    }

    // ユーザー更新
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    revalidatePath('/users');
    revalidatePath('/admin/users');
    revalidatePath(`/users/${id}`);

    return {
      success: true,
      message: `ユーザー「${updatedUser.name}」を更新しました`,
    };
  } catch (error) {
    console.error('Error updating user:', error);
    
    return {
      errors: {
        _form: ['ユーザーの更新に失敗しました。もう一度お試しください。'],
      },
    };
  }
}