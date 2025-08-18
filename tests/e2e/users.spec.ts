import { test, expect } from "@playwright/test";

test.describe("Users Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to users page before each test
    await page.goto("/users");
  });

  test("should display users page with basic elements", async ({ page }) => {
    // Check page title and description
    await expect(page.getByRole("heading", { name: "ユーザー管理" })).toBeVisible();
    await expect(page.getByText("登録されているユーザーの一覧と管理")).toBeVisible();

    // Check "新規ユーザー追加" button
    await expect(page.getByRole("link", { name: "新規ユーザー追加" })).toBeVisible();

    // Check search form elements
    await expect(page.getByRole("textbox", { name: "名前またはメールアドレスで検索" })).toBeVisible();
    await expect(page.getByRole("button", { name: "検索" })).toBeVisible();
    await expect(page.getByRole("button", { name: "リセット" })).toBeVisible();

    // Check table headers (use text-based checks since Mantine may not use proper roles)
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByRole("table").getByText("名前")).toBeVisible();
    await expect(page.getByRole("table").getByText("メールアドレス")).toBeVisible();
    await expect(page.getByRole("table").getByText("ロール")).toBeVisible();
    await expect(page.getByRole("table").getByText("登録日")).toBeVisible();
    await expect(page.getByRole("table").getByText("操作")).toBeVisible();
  });

  test("should perform search functionality", async ({ page }) => {
    // Enter search term
    await page.getByRole("textbox", { name: "名前またはメールアドレスで検索" }).fill("test");
    
    // Click search button
    await page.getByRole("button", { name: "検索" }).click();
    
    // Check that URL contains search parameter
    await expect(page).toHaveURL(/.*search=test.*/);
  });

  test("should reset search functionality", async ({ page }) => {
    // First perform a search
    await page.getByRole("textbox", { name: "名前またはメールアドレスで検索" }).fill("test");
    await page.getByRole("button", { name: "検索" }).click();
    
    // Then reset
    await page.getByRole("button", { name: "リセット" }).click();
    
    // Check that URL is reset to base users page
    await expect(page).toHaveURL("/users");
    
    // Check that search input is cleared
    await expect(page.getByRole("textbox", { name: "名前またはメールアドレスで検索" })).toHaveValue("");
  });

  test("should navigate to user detail page when edit button is clicked", async ({ page }) => {
    // Wait for table to load
    await page.getByRole("table").waitFor();
    
    // Check if there are any edit buttons (users exist)
    const editButtons = page.getByRole("button", { name: "編集" });
    const editButtonCount = await editButtons.count();
    
    if (editButtonCount > 0) {
      // Click the first edit button
      await editButtons.first().click();
      
      // Should navigate to user detail page
      await expect(page).toHaveURL(/\/users\/[^\/]+$/);
      
      // Check user detail page elements
      await expect(page.getByRole("heading", { name: "ユーザー詳細" })).toBeVisible();
      await expect(page.getByRole("button", { name: "ユーザー一覧に戻る" })).toBeVisible();
    }
  });

  test("should display pagination when there are multiple pages", async ({ page }) => {
    // Check if pagination exists (only if there are multiple pages)
    const paginationExists = await page.locator("[data-pagination]").count() > 0;
    
    if (paginationExists) {
      await expect(page.locator("[data-pagination]")).toBeVisible();
    }
  });

  test("should handle empty search results gracefully", async ({ page }) => {
    // Search for something that doesn't exist
    await page.getByRole("textbox", { name: "名前またはメールアドレスで検索" }).fill("nonexistentuser12345");
    await page.getByRole("button", { name: "検索" }).click();
    
    // Should display "no results" message
    await expect(page.getByText("検索条件に一致するユーザーが見つかりませんでした")).toBeVisible();
  });

  test("should display delete modal when delete button is clicked", async ({ page }) => {
    // Wait for table to load
    await page.getByRole("table").waitFor();
    
    // Check if there are any delete buttons (users exist)
    const deleteButtons = page.getByRole("button", { name: "削除" });
    const deleteButtonCount = await deleteButtons.count();
    
    if (deleteButtonCount > 0) {
      // Click the first delete button
      await deleteButtons.first().click();
      
      // Should show delete modal
      await expect(page.getByText("ユーザー削除")).toBeVisible();
      await expect(page.getByText("この操作は取り消すことができません。")).toBeVisible();
      
      // Should have cancel and delete buttons in modal
      await expect(page.getByRole("button", { name: "キャンセル" })).toBeVisible();
      await expect(page.getByLabel("ユーザー削除").getByRole("button", { name: "削除" })).toBeVisible();
      
      // Close modal with cancel
      await page.getByRole("button", { name: "キャンセル" }).click();
      
      // Modal should be closed
      await expect(page.getByText("ユーザー削除")).not.toBeVisible();
    }
  });
  test("should navigate to new user page when 新規ユーザー追加 is clicked", async ({ page }) => {
    // Click the "新規ユーザー追加" link
    await page.getByRole("link", { name: "新規ユーザー追加" }).click();
    
    // Should navigate to new user page
    await expect(page).toHaveURL("/users/new");
    
    // Check new user page elements
    await expect(page.getByRole("heading", { name: "新規ユーザー作成" })).toBeVisible();
    await expect(page.getByText("新しいユーザーを登録します")).toBeVisible();
    await expect(page.getByRole("link", { name: "ユーザー一覧に戻る" })).toBeVisible();
  });
});

test.describe("New User Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users/new");
  });

  test("should display new user page with form elements", async ({ page }) => {
    // Check page title and description
    await expect(page.getByRole("heading", { name: "新規ユーザー作成" })).toBeVisible();
    await expect(page.getByText("新しいユーザーを登録します")).toBeVisible();

    // Check form elements exist
    await expect(page.getByText("名前")).toBeVisible();
    await expect(page.getByText("メールアドレス")).toBeVisible();
    await expect(page.getByText("パスワード")).toBeVisible();
    await expect(page.getByText("ロール")).toBeVisible();

    // Check form has create button
    await expect(page.getByRole("button", { name: "作成" })).toBeVisible();

    // Check back button
    await expect(page.getByRole("link", { name: "ユーザー一覧に戻る" })).toBeVisible();
  });

  test("should allow navigation back to users list", async ({ page }) => {
    // Click back button
    await page.getByRole("link", { name: "ユーザー一覧に戻る" }).click();
    
    // Should be back on users page
    await expect(page).toHaveURL("/users");
    await expect(page.getByRole("heading", { name: "ユーザー管理" })).toBeVisible();
  });
});

test.describe("User Detail Page", () => {
  test("should handle invalid user ID gracefully", async ({ page }) => {
    // Navigate to a non-existent user ID
    const response = await page.goto("/users/nonexistent-id");
    
    // Check if page shows error state or redirects appropriately
    // Instead of waiting for API response, check page content
    await page.waitForLoadState('networkidle');
    
    // Should show some error indication or redirect to users list
    const pageText = await page.textContent('body');
    const hasErrorMessage = pageText?.includes('見つかりません') || 
                           pageText?.includes('エラー') || 
                           page.url().includes('/users') && !page.url().includes('/users/nonexistent-id');
    
    expect(hasErrorMessage).toBeTruthy();
  });

  test("should display user edit form when valid user ID is provided", async ({ page }) => {
    // First go to users page to get a valid user ID
    await page.goto("/users");
    await page.getByRole("table").waitFor();
    
    const editButtons = page.getByRole("button", { name: "編集" });
    const editButtonCount = await editButtons.count();
    
    if (editButtonCount > 0) {
      await editButtons.first().click();
      
      // Should be on user detail page
      await expect(page.getByRole("heading", { name: "ユーザー詳細" })).toBeVisible();
      
      // Should have user form
      await expect(page.getByRole("button", { name: "ユーザー更新" })).toBeVisible();
      await expect(page.getByText("名前")).toBeVisible();
      await expect(page.getByText("メールアドレス")).toBeVisible();
      await expect(page.getByText("ロール")).toBeVisible();
      
      // Should have back button
      await expect(page.getByRole("button", { name: "ユーザー一覧に戻る" })).toBeVisible();
    }
  });

  test("should allow navigation back to users list", async ({ page }) => {
    // First navigate to users page and then to a user detail
    await page.goto("/users");
    await page.getByRole("table").waitFor();
    
    const editButtons = page.getByRole("button", { name: "編集" });
    const editButtonCount = await editButtons.count();
    
    if (editButtonCount > 0) {
      await editButtons.first().click();
      
      // Click back button
      await page.getByRole("button", { name: "ユーザー一覧に戻る" }).click();
      
      // Should be back on users page
      await expect(page).toHaveURL("/users");
      await expect(page.getByRole("heading", { name: "ユーザー管理" })).toBeVisible();
    }
  });
});