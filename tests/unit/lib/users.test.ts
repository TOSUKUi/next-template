import { fetchUsers } from "@/lib/users";

// Mock fetch
global.fetch = jest.fn();

const baseUrl = "http://test.example.com";

describe("fetchUsers function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const urlBuildingCases = [
    [{}, "page=1&limit=10"],
    [{ page: "2", limit: "5" }, "page=2&limit=5"],
    [{ search: "test", role: "admin" }, "page=1&limit=10&search=test&role=admin"],
    [{ page: "3", search: "user", role: "user" }, "page=3&limit=10&search=user&role=user"],
    [{ page: undefined, limit: undefined, search: undefined, role: undefined }, "page=1&limit=10"],
  ] as const;

  test.each(urlBuildingCases)("builds URL correctly for params %j", async (params, expectedQuery) => {
    const mockResponse = {
      users: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await fetchUsers(params, { baseUrl });

    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/users?${expectedQuery}`,
      { cache: "no-store" }
    );
  });

  test("returns success response correctly", async () => {
    const mockResponse = {
      users: [
        {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
          role: "user",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await fetchUsers({}, { baseUrl });

    expect(result).toEqual(mockResponse);
  });

  test("handles network errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network Error"));

    const result = await fetchUsers({}, { baseUrl });

    expect(result).toEqual({
      users: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      error: "Network Error",
    });
  });

  test("handles non-ok responses gracefully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await fetchUsers({}, { baseUrl });

    expect(result).toEqual({
      users: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      error: "ユーザー一覧の取得に失敗しました",
    });
  });
});