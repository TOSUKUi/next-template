import { test, expect } from '@playwright/test';

test.describe('Loading UI Tests', () => {
  test('should display loading UI on test-loading page', async ({ page }) => {
    // ページに移動（ナビゲーションでloading.tsxを発生させる）
    await page.goto('/');
    
    // Next.jsのナビゲーション（Link）でtest-loadingページに遷移
    await page.click('a[href="/test-loading"]', { timeout: 1000 }).catch(() => {
      // リンクが存在しない場合はdirect gotoで確認
    });
    
    // 直接アクセスの場合はSuspenseのfallbackをテスト
    await page.goto('/test-loading');
    
    // ページタイトルが表示されることを確認
    await expect(page.getByText('Loading UIテストページ')).toBeVisible();
    
    // Suspenseローディング（fallback）が表示されることを確認
    await expect(page.getByText('Suspenseローディング中...')).toBeVisible();
  });

  test('should show content after loading completes', async ({ page }) => {
    // ページにアクセス
    await page.goto('/test-loading');
    
    // 最初はSuspenseローディングが表示される
    await expect(page.getByText('Suspenseローディング中...')).toBeVisible();
    
    // 5秒待機（3秒の遅延 + 余裕）
    await page.waitForTimeout(5000);
    
    // ローディング完了後のコンテンツが表示される
    await expect(page.getByText('データ読み込み完了！')).toBeVisible();
    await expect(page.getByText('3秒の遅延後に表示されるコンテンツです。')).toBeVisible();
  });

  test('should have working navigation buttons', async ({ page }) => {
    await page.goto('/test-loading');
    
    // ホームに戻るボタンのテスト
    await page.waitForTimeout(4000); // コンテンツ読み込み待機
    await page.click('text=ホームに戻る');
    await expect(page).toHaveURL('/');
  });

  test('should reload page when clicking reload button', async ({ page }) => {
    await page.goto('/test-loading');
    
    // ページリロードボタンのテスト
    await page.waitForTimeout(4000); // コンテンツ読み込み待機
    
    const reloadButton = page.getByText('ローディングテスト開始（ページリロード）');
    await expect(reloadButton).toBeVisible();
    
    // ボタンクリックで再度ローディングが表示されることを確認
    await reloadButton.click();
    await expect(page.getByText('Suspenseローディング中...')).toBeVisible();
  });
});