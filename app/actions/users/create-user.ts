'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

const CreateUserSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(255, '名前は255文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください').max(255),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください').max(100),
  role: z.enum(['user', 'admin']).default('user'),
});

export type CreateUserFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
    _form?: string[];
  };
};

export async function createUser(
  prevState: CreateUserFormState,
  formData: FormData
): Promise<CreateUserFormState> {
  const validatedFields = CreateUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, role } = validatedFields.data;

  try {
    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        errors: {
          email: ['このメールアドレスは既に使用されています'],
        },
      };
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザー作成
    const user = await prisma.user.create({
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
        createdAt: true,
      },
    });

    revalidatePath('/users');
    revalidatePath('/admin/users');

    return {
      success: true,
      message: `ユーザー「${user.name}」を作成しました`,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    
    return {
      errors: {
        _form: ['ユーザーの作成に失敗しました。もう一度お試しください。'],
      },
    };
  }
}