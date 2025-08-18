import { deleteUser } from "@/app/actions/users/delete-user";
import prisma from "@/lib/prisma";

jest.mock("@/lib/prisma");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe("deleteUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validCuid = "clxyz123456789abcdef"; // 有効なcuid形式の例

  const mockUser = {
    id: validCuid,
    name: "Test User",
  };

  it("should delete user successfully", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockedPrisma.user.delete.mockResolvedValue({
      id: validCuid,
      name: "Test User",
      email: "test@example.com",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const formData = new FormData();
    formData.append("id", validCuid);

    const result = await deleteUser({ success: false }, formData);

    expect(result.success).toBe(true);
    expect(result.message).toBe("ユーザー「Test User」を削除しました");
    expect(mockedPrisma.user.delete).toHaveBeenCalledWith({
      where: { id: validCuid },
    });
  });

  it("should return validation error for invalid id", async () => {
    const formData = new FormData();
    formData.append("id", "invalid-id");

    const result = await deleteUser({ success: false }, formData);

    expect(result.success).toBeUndefined();
    expect(result.errors?._form).toContain("無効なユーザーIDです");
  });

  it("should return error when user not found", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const formData = new FormData();
    formData.append("id", validCuid);

    const result = await deleteUser({ success: false }, formData);

    expect(result.success).toBeUndefined();
    expect(result.errors?._form).toContain("ユーザーが見つかりません");
  });

  it("should handle database errors during deletion", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockedPrisma.user.delete.mockRejectedValue(new Error("Database error"));

    const formData = new FormData();
    formData.append("id", validCuid);

    const result = await deleteUser({ success: false }, formData);

    expect(result.success).toBeUndefined();
    expect(result.errors?._form).toContain("ユーザーの削除に失敗しました。もう一度お試しください。");
  });

  it("should handle database errors during user lookup", async () => {
    mockedPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

    const formData = new FormData();
    formData.append("id", validCuid);

    const result = await deleteUser({ success: false }, formData);

    expect(result.success).toBeUndefined();
    expect(result.errors?._form).toContain("ユーザーの削除に失敗しました。もう一度お試しください。");
  });

  it("should require user id", async () => {
    const formData = new FormData();
    // idを設定しない

    const result = await deleteUser({ success: false }, formData);

    expect(result.success).toBeUndefined();
    expect(result.errors?._form).toContain("無効なユーザーIDです");
  });
});