import { GET } from "@/app/api/users/[id]/route";
import prisma from "@/lib/prisma";

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe("/api/users/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    role: "user",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  const expectedUser = {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    role: "user",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  it("should return user by id", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(mockUser);

    const request = {} as any; // Mock request object
    const params = Promise.resolve({ id: "user-123" });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toEqual(expectedUser);

    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-123" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it("should return 404 when user not found", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const request = {} as any;
    const params = Promise.resolve({ id: "nonexistent" });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("ユーザーが見つかりません");
  });

  it("should handle database errors", async () => {
    mockedPrisma.user.findUnique.mockRejectedValue(
      new Error("Database connection failed"),
    );

    const request = {} as any;
    const params = Promise.resolve({ id: "user-123" });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("ユーザー情報の取得に失敗しました");
  });

  it("should handle invalid user id format", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const request = {} as any;
    const params = Promise.resolve({ id: "123" });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("ユーザーが見つかりません");
  });
});