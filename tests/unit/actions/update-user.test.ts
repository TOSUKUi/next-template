import { updateUser } from "@/app/actions/users/update-user";
import prisma from "@/lib/prisma";

jest.mock("@/lib/prisma");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe("updateUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validCuid = "clxyz123456789abcdef"; // 有効なcuid形式の例

  const mockUser = {
    id: validCuid,
    name: "Original User",
    email: "original@example.com",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUpdatedUser = {
    id: validCuid,
    name: "Updated User",
    email: "updated@example.com",
    role: "admin" as const,
    updatedAt: new Date(),
  };

  it("should update user successfully with valid data", async () => {
    mockedPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
    mockedPrisma.user.findUnique.mockResolvedValueOnce(null); // メールアドレス重複チェック
    mockedPrisma.user.update.mockResolvedValue(mockUpdatedUser);

    const formData = new FormData();
    formData.append("id", validCuid);
    formData.append("name", "Updated User");
    formData.append("email", "updated@example.com");
    formData.append("role", "admin");

    const result = await updateUser({ success: false }, formData);

    expect(result.success).toBe(true);
    expect(result.message).toBe("ユーザー「Updated User」を更新しました");
    expect(mockedPrisma.user.update).toHaveBeenCalledWith({
      where: { id: validCuid },
      data: {
        name: "Updated User",
        email: "updated@example.com",
        role: "admin",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });
  });

  it("should return validation errors for invalid data", async () => {
    const formData = new FormData();
    formData.append("id", "invalid-id");
    formData.append("name", "");
    formData.append("email", "invalid-email");
    formData.append("role", "invalid-role");

    const result = await updateUser({ success: false }, formData);

    expect(result.success).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors?.name).toContain("名前は必須です");
    expect(result.errors?.email).toContain("有効なメールアドレスを入力してください");
  });

  it("should return error when user not found", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const formData = new FormData();
    formData.append("id", validCuid);
    formData.append("name", "Updated User");
    formData.append("email", "updated@example.com");
    formData.append("role", "user");

    const result = await updateUser({ success: false }, formData);

    expect(result.success).toBeUndefined();
    expect(result.errors?._form).toContain("ユーザーが見つかりません");
  });

  it("should return error when email already exists", async () => {
    const existingUserWithSameEmail = {
      id: "other-user",
      email: "existing@example.com",
      name: "Other User",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
    mockedPrisma.user.findUnique.mockResolvedValueOnce(existingUserWithSameEmail);

    const formData = new FormData();
    formData.append("id", validCuid);
    formData.append("name", "Updated User");
    formData.append("email", "existing@example.com");
    formData.append("role", "user");

    const result = await updateUser({ success: false }, formData);

    expect(result.success).toBeUndefined();
    expect(result.errors?.email).toContain("このメールアドレスは既に使用されています");
  });

  it("should allow keeping the same email address", async () => {
    mockedPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
    // 同じメールアドレスの場合は重複チェックをスキップ
    mockedPrisma.user.update.mockResolvedValue({
      ...mockUpdatedUser,
      email: mockUser.email,
    });

    const formData = new FormData();
    formData.append("id", validCuid);
    formData.append("name", "Updated User");
    formData.append("email", "original@example.com"); // 同じメールアドレス
    formData.append("role", "admin");

    const result = await updateUser({ success: false }, formData);

    expect(result.success).toBe(true);
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledTimes(1); // 重複チェックはスキップ
  });

  it("should handle database errors", async () => {
    mockedPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
    mockedPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockedPrisma.user.update.mockRejectedValue(new Error("Database error"));

    const formData = new FormData();
    formData.append("id", validCuid);
    formData.append("name", "Updated User");
    formData.append("email", "updated@example.com");
    formData.append("role", "user");

    const result = await updateUser({ success: false }, formData);

    expect(result.success).toBeUndefined();
    expect(result.errors?._form).toContain("ユーザーの更新に失敗しました。もう一度お試しください。");
  });
});