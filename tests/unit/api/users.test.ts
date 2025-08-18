import { GET } from "@/app/api/users/route";
import prisma from "@/lib/prisma";

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  user: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe("/api/users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (searchParams: Record<string, string> = {}) => {
    const url = new URL("http://localhost:3000/api/users");
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    // Create a mock request object that matches NextRequest interface
    return {
      nextUrl: url,
    } as any;
  };

  const mockUsers = [
    {
      id: "user-1",
      name: "Test User 1",
      email: "test1@example.com",
      role: "user",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "user-2",
      name: "Test User 2",
      email: "test2@example.com",
      role: "admin",
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
    },
  ];

  const expectedUsers = [
    {
      id: "user-1",
      name: "Test User 1",
      email: "test1@example.com",
      role: "user",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "user-2",
      name: "Test User 2",
      email: "test2@example.com",
      role: "admin",
      createdAt: "2024-01-02T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    },
  ];

  it("should return users with default pagination", async () => {
    mockedPrisma.user.findMany.mockResolvedValue(mockUsers);
    mockedPrisma.user.count.mockResolvedValue(2);

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.users).toEqual(expectedUsers);
    expect(data.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });

    expect(mockedPrisma.user.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });

  it("should handle pagination parameters", async () => {
    mockedPrisma.user.findMany.mockResolvedValue([mockUsers[1]]);
    mockedPrisma.user.count.mockResolvedValue(2);

    const request = createMockRequest({ page: "2", limit: "1" });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination).toEqual({
      page: 2,
      limit: 1,
      total: 2,
      totalPages: 2,
      hasNext: false,
      hasPrev: true,
    });

    expect(mockedPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 1,
        take: 1,
      }),
    );
  });

  it("should handle search parameter", async () => {
    const filteredUsers = [mockUsers[0]];
    mockedPrisma.user.findMany.mockResolvedValue(filteredUsers);
    mockedPrisma.user.count.mockResolvedValue(1);

    const request = createMockRequest({ search: "Test User 1" });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.users).toEqual([expectedUsers[0]]);

    expect(mockedPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { name: { contains: "Test User 1" } },
            { email: { contains: "Test User 1" } },
          ],
        },
      }),
    );
  });

  it("should handle role filter", async () => {
    const adminUsers = [mockUsers[1]];
    mockedPrisma.user.findMany.mockResolvedValue(adminUsers);
    mockedPrisma.user.count.mockResolvedValue(1);

    const request = createMockRequest({ role: "admin" });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.users).toEqual([expectedUsers[1]]);

    expect(mockedPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { role: "admin" },
      }),
    );
  });

  it("should handle combined search and role filter", async () => {
    const filteredUsers = [mockUsers[1]];
    mockedPrisma.user.findMany.mockResolvedValue(filteredUsers);
    mockedPrisma.user.count.mockResolvedValue(1);

    const request = createMockRequest({ search: "Test", role: "admin" });
    const response = await GET(request);

    expect(mockedPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { name: { contains: "Test" } },
            { email: { contains: "Test" } },
          ],
          role: "admin",
        },
      }),
    );
  });

  it("should limit maximum results to 100", async () => {
    mockedPrisma.user.findMany.mockResolvedValue([]);
    mockedPrisma.user.count.mockResolvedValue(0);

    const request = createMockRequest({ limit: "200" });
    await GET(request);

    expect(mockedPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 100,
      }),
    );
  });

  it("should handle database errors", async () => {
    mockedPrisma.user.findMany.mockRejectedValue(
      new Error("Database connection failed"),
    );

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("ユーザー一覧の取得に失敗しました");
  });
});