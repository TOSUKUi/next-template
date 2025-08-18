export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}

export async function fetchUsers(
  searchParams: { [key: string]: string | undefined },
  options: { baseUrl?: string } = {}
): Promise<UserResponse> {
  try {
    const params = new URLSearchParams();

    // デフォルト値の設定
    params.set("page", searchParams.page || "1");
    params.set("limit", searchParams.limit || "10");

    // 検索パラメータの追加
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.role) params.set("role", searchParams.role);

    const baseUrl = options.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/users?${params}`,
      {
        cache: "no-store", // Always get fresh data
      },
    );

    if (!response.ok) {
      throw new Error("ユーザー一覧の取得に失敗しました");
    }

    return (await response.json()) as UserResponse;
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      users: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      error: error instanceof Error ? error.message : "エラーが発生しました",
    };
  }
}