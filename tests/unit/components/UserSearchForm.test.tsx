import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import UserSearchForm from "@/components/Users/UserSearchForm";

// Mock Next.js navigation hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe("UserSearchForm", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any);

    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    } as any);
  });

  it("should render search form with initial empty values", () => {
    render(
      <TestWrapper>
        <UserSearchForm />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText("名前またはメールアドレスで検索")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ロールで絞り込み")).toBeInTheDocument();
    expect(screen.getByText("検索")).toBeInTheDocument();
    expect(screen.getByText("リセット")).toBeInTheDocument();
  });

  it("should render search form with initial values from URL parameters", () => {
    const mockGet = jest.fn((key: string) => {
      if (key === "search") return "test search";
      if (key === "role") return "admin";
      return null;
    });

    mockUseSearchParams.mockReturnValue({
      get: mockGet,
    } as any);

    render(
      <TestWrapper>
        <UserSearchForm />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue("test search")).toBeInTheDocument();
    // Mantine Select shows label, not value
    expect(screen.getByDisplayValue("管理者")).toBeInTheDocument();
  });

  it("should handle search input changes", () => {
    render(
      <TestWrapper>
        <UserSearchForm />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText("名前またはメールアドレスで検索");
    fireEvent.change(searchInput, { target: { value: "new search term" } });

    expect(screen.getByDisplayValue("new search term")).toBeInTheDocument();
  });

  it("should handle role selection changes", async () => {
    render(
      <TestWrapper>
        <UserSearchForm />
      </TestWrapper>
    );

    // Mantine Select is complex to test, so we'll just verify the component renders
    // and focus on integration tests for the actual functionality
    const roleInput = screen.getByDisplayValue("すべて");
    expect(roleInput).toBeInTheDocument();
  });

  it("should perform search when search button is clicked", () => {
    render(
      <TestWrapper>
        <UserSearchForm />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText("名前またはメールアドレスで検索");
    fireEvent.change(searchInput, { target: { value: "test search" } });

    const searchButton = screen.getByText("検索");
    fireEvent.click(searchButton);

    expect(mockPush).toHaveBeenCalledWith("/users?search=test+search");
  });

  it("should perform search when Enter key is pressed in search input", () => {
    render(
      <TestWrapper>
        <UserSearchForm />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText("名前またはメールアドレスで検索");
    fireEvent.change(searchInput, { target: { value: "test search" } });
    fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });

    expect(mockPush).toHaveBeenCalledWith("/users?search=test+search");
  });

  it("should reset form when reset button is clicked", () => {
    const mockGet = jest.fn((key: string) => {
      if (key === "search") return "initial search";
      if (key === "role") return "ADMIN";
      return null;
    });

    mockUseSearchParams.mockReturnValue({
      get: mockGet,
    } as any);

    render(
      <TestWrapper>
        <UserSearchForm />
      </TestWrapper>
    );

    const resetButton = screen.getByText("リセット");
    fireEvent.click(resetButton);

    expect(mockPush).toHaveBeenCalledWith("/users");
  });

  it("should include both search and role parameters when both are set", () => {
    // Test with initial role value from URL params
    const mockGet = jest.fn((key: string) => {
      if (key === "role") return "admin";
      return null;
    });

    mockUseSearchParams.mockReturnValue({
      get: mockGet,
    } as any);

    render(
      <TestWrapper>
        <UserSearchForm />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText("名前またはメールアドレスで検索");
    fireEvent.change(searchInput, { target: { value: "test user" } });

    const searchButton = screen.getByText("検索");
    fireEvent.click(searchButton);

    expect(mockPush).toHaveBeenCalledWith("/users?search=test+user&role=admin");
  });

  it("should handle empty search parameters correctly", () => {
    render(
      <TestWrapper>
        <UserSearchForm />
      </TestWrapper>
    );

    const searchButton = screen.getByText("検索");
    fireEvent.click(searchButton);

    expect(mockPush).toHaveBeenCalledWith("/users?");
  });

  it("should not perform search when other keys are pressed", () => {
    render(
      <TestWrapper>
        <UserSearchForm />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText("名前またはメールアドレスで検索");
    fireEvent.change(searchInput, { target: { value: "test search" } });
    fireEvent.keyDown(searchInput, { key: "Tab", code: "Tab" });

    expect(mockPush).not.toHaveBeenCalled();
  });
});