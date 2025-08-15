'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const DeleteProductSchema = z.object({
  id: z.string().cuid(),
});

export type DeleteProductFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    _form?: string[];
  };
};

export async function deleteProduct(
  prevState: DeleteProductFormState,
  formData: FormData
): Promise<DeleteProductFormState> {
  const validatedFields = DeleteProductSchema.safeParse({
    id: formData.get('id'),
  });

  if (!validatedFields.success) {
    return {
      errors: {
        _form: ['無効な商品IDです'],
      },
    };
  }

  const { id } = validatedFields.data;

  try {
    // 商品存在チェック
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        userId: true,
      },
    });

    if (!product) {
      return {
        errors: {
          _form: ['商品が見つかりません'],
        },
      };
    }

    // 商品削除
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath('/products');
    revalidatePath('/admin/products');
    revalidatePath(`/users/${product.userId}`);

    return {
      success: true,
      message: `商品「${product.name}」を削除しました`,
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    
    return {
      errors: {
        _form: ['商品の削除に失敗しました。もう一度お試しください。'],
      },
    };
  }
}