import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import NewUserPage from "@/app/users/new/page";

// UserFormコンポーネントをモック化
jest.mock("@/components/forms/UserForm", () => {
  return function MockUserForm({ mode }: { mode: string }) {
    return <div data-testid="user-form" data-mode={mode}>User Form Mock</div>;
  };
});

// MainLayoutコンポーネントをモック化
jest.mock("@/components/Layout/MainLayout", () => {
  return function MockMainLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="main-layout">{children}</div>;
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe("NewUserPage", () => {
  it("ページタイトルが正しく表示される", () => {
    renderWithProviders(<NewUserPage />);
    
    expect(screen.getByText("新規ユーザー作成")).toBeInTheDocument();
    expect(screen.getByText("新しいユーザーを登録します")).toBeInTheDocument();
  });

  it("ユーザー一覧に戻るリンクが表示される", () => {
    renderWithProviders(<NewUserPage />);
    
    const backLink = screen.getByRole("link", { name: /ユーザー一覧に戻る/ });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/users");
  });

  it("ユーザーフォームがcreateモードで表示される", () => {
    renderWithProviders(<NewUserPage />);
    
    const userForm = screen.getByTestId("user-form");
    expect(userForm).toBeInTheDocument();
    expect(userForm).toHaveAttribute("data-mode", "create");
  });

  it("MainLayoutが使用される", () => {
    renderWithProviders(<NewUserPage />);
    
    expect(screen.getByTestId("main-layout")).toBeInTheDocument();
  });
});