import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { useActionState } from "react";
import UserForm from "@/components/forms/UserForm";

// Mock the server actions
jest.mock("@/app/actions/users/create-user", () => ({
  createUser: jest.fn(),
}));

jest.mock("@/app/actions/users/update-user", () => ({
  updateUser: jest.fn(),
}));

// Mock useActionState since it's a React 19 hook
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useActionState: jest.fn(),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

const mockUseActionState = useActionState as jest.MockedFunction<typeof useActionState>;

describe("UserForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render create form correctly", () => {
    mockUseActionState.mockReturnValue([
      { success: false },
      jest.fn(),
      false, // pending
    ]);

    render(
      <TestWrapper>
        <UserForm mode="create" />
      </TestWrapper>
    );

    expect(screen.getByText("ユーザー作成")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /名前/ })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /メールアドレス/ })).toBeInTheDocument();
    expect(screen.getByText("パスワード")).toBeInTheDocument();
    expect(screen.getByText("ロール")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "作成" })).toBeInTheDocument();
  });

  it("should render update form correctly", () => {
    mockUseActionState.mockReturnValue([
      { success: false },
      jest.fn(),
      false, // pending
    ]);

    const initialData = {
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
      role: "user" as const,
    };

    render(
      <TestWrapper>
        <UserForm mode="update" initialData={initialData} />
      </TestWrapper>
    );

    expect(screen.getByText("ユーザー更新")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
    expect(screen.queryByLabelText("パスワード")).not.toBeInTheDocument(); // パスワードフィールドは更新時には表示されない
    expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
  });

  it("should display validation errors", () => {
    mockUseActionState.mockReturnValue([
      {
        success: false,
        errors: {
          name: ["名前は必須です"],
          email: ["有効なメールアドレスを入力してください"],
          password: ["パスワードは6文字以上で入力してください"],
        },
      },
      jest.fn(),
      false,
    ]);

    render(
      <TestWrapper>
        <UserForm mode="create" />
      </TestWrapper>
    );

    expect(screen.getByText("名前は必須です")).toBeInTheDocument();
    expect(
      screen.getByText("有効なメールアドレスを入力してください")
    ).toBeInTheDocument();
    expect(
      screen.getByText("パスワードは6文字以上で入力してください")
    ).toBeInTheDocument();
  });

  it("should display form-level errors", () => {
    mockUseActionState.mockReturnValue([
      {
        success: false,
        errors: {
          _form: ["サーバーエラーが発生しました"],
        },
      },
      jest.fn(),
      false,
    ]);

    render(
      <TestWrapper>
        <UserForm mode="create" />
      </TestWrapper>
    );

    expect(screen.getByText("サーバーエラーが発生しました")).toBeInTheDocument();
  });

  it("should display success message", () => {
    mockUseActionState.mockReturnValue([
      {
        success: true,
        message: "ユーザーを作成しました",
      },
      jest.fn(),
      false,
    ]);

    render(
      <TestWrapper>
        <UserForm mode="create" />
      </TestWrapper>
    );

    expect(screen.getByText("ユーザーを作成しました")).toBeInTheDocument();
  });

  it("should show loading state when pending", () => {
    mockUseActionState.mockReturnValue([
      { success: false },
      jest.fn(),
      true, // pending
    ]);

    render(
      <TestWrapper>
        <UserForm mode="create" />
      </TestWrapper>
    );

    const submitButton = screen.getByRole("button", { name: "作成" });
    expect(submitButton).toBeDisabled();
  });

  it("should call onSuccess callback when form succeeds", async () => {
    const onSuccess = jest.fn();
    const mockFormAction = jest.fn();

    mockUseActionState.mockReturnValue([
      { success: true, message: "Success!" },
      mockFormAction,
      false,
    ]);

    render(
      <TestWrapper>
        <UserForm mode="create" onSuccess={onSuccess} />
      </TestWrapper>
    );

    const form = screen.getByRole("button", { name: "作成" }).closest("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    }
  });

  it("should include user id in form data for update mode", async () => {
    const mockFormAction = jest.fn();
    mockUseActionState.mockReturnValue([
      { success: false },
      mockFormAction,
      false,
    ]);

    const initialData = {
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
      role: "user" as const,
    };

    render(
      <TestWrapper>
        <UserForm mode="update" initialData={initialData} />
      </TestWrapper>
    );

    const nameInput = screen.getByRole("textbox", { name: /名前/ });
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    const form = screen.getByRole("button", { name: "更新" }).closest("form");
    if (form) {
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockFormAction).toHaveBeenCalled();
      });

      // FormDataに"id"が含まれることを確認
      const formData = mockFormAction.mock.calls[0][0] as FormData;
      expect(formData.get("id")).toBe("user-123");
    }
  });

  it("should have proper form field attributes", () => {
    mockUseActionState.mockReturnValue([
      { success: false },
      jest.fn(),
      false,
    ]);

    render(
      <TestWrapper>
        <UserForm mode="create" />
      </TestWrapper>
    );

    const nameInput = screen.getByRole("textbox", { name: /名前/ });
    const emailInput = screen.getByRole("textbox", { name: /メールアドレス/ });

    expect(nameInput).toHaveAttribute("name", "name");
    expect(nameInput).toHaveAttribute("required");

    expect(emailInput).toHaveAttribute("name", "email");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("required");

    // パスワードフィールドの検証は別のテストに分ける
    expect(screen.getByText("パスワード")).toBeInTheDocument();
  });
});