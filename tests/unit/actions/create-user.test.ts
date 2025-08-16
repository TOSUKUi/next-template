import { createUser } from "@/app/actions/users/create-user";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

jest.mock("@/lib/prisma");
jest.mock("bcryptjs");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("createUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create user successfully with valid data", async () => {
    const mockUser = {
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
      role: "user" as const,
      createdAt: new Date(),
    };

    mockedPrisma.user.findUnique.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue("hashed-password");
    mockedPrisma.user.create.mockResolvedValue(mockUser);

    const formData = new FormData();
    formData.append("name", "Test User");
    formData.append("email", "test@example.com");
    formData.append("password", "password123");
    formData.append("role", "user");

    const result = await createUser({ success: false }, formData);

    expect(result.success).toBe(true);
    expect(result.message).toBe("ユーザー「Test User」を作成しました");
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(mockedBcrypt.hash).toHaveBeenCalledWith("password123", 12);
  });

  it("should return validation errors for invalid data", async () => {
    const formData = new FormData();
    formData.append("name", "");
    formData.append("email", "invalid-email");
    formData.append("password", "123");

    const result = await createUser({ success: false }, formData);

    expect(result.success).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors?.name).toContain("名前は必須です");
    expect(result.errors?.email).toContain(
      "有効なメールアドレスを入力してください",
    );
    expect(result.errors?.password).toContain(
      "パスワードは6文字以上で入力してください",
    );
  });

  it("should return error when email already exists", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: "existing-user",
      email: "test@example.com",
      name: "Existing User",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const formData = new FormData();
    formData.append("name", "Test User");
    formData.append("email", "test@example.com");
    formData.append("password", "password123");
    formData.append("role", "user");

    const result = await createUser({ success: false }, formData);

    expect(result.success).toBeUndefined();
    expect(result.errors?.email).toContain(
      "このメールアドレスは既に使用されています",
    );
  });
});
