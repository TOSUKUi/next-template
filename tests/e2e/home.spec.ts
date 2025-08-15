import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the main page with correct elements', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/Next.js Template/);

    // Check main heading
    await expect(page.getByRole('heading', { name: 'Next.js Template' })).toBeVisible();

    // Check description
    await expect(page.getByText('Next.js 15 + Mantine v8 + Prisma を使用したモダンなWebアプリケーションテンプレート')).toBeVisible();

    // Check feature cards
    await expect(page.getByText('Next.js 15')).toBeVisible();
    await expect(page.getByText('Mantine v8')).toBeVisible();
    await expect(page.getByText('Prisma ORM')).toBeVisible();
    await expect(page.getByText('API Routes')).toBeVisible();

    // Check quick start buttons
    await expect(page.getByRole('link', { name: 'ユーザー管理' })).toBeVisible();
    await expect(page.getByRole('link', { name: '商品管理' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ヘルスチェック' })).toBeVisible();
  });

  test('should navigate to health check API', async ({ page }) => {
    await page.goto('/');

    // Click health check button
    await page.getByRole('link', { name: 'ヘルスチェック' }).click();

    // Should navigate to health check endpoint
    await expect(page).toHaveURL('/api/health');
    
    // Check if response contains health status
    const content = await page.textContent('body');
    expect(content).toContain('"status"');
  });

  test('should have responsive navigation', async ({ page }) => {
    await page.goto('/');

    // Check navigation items are visible
    await expect(page.getByRole('link', { name: 'ホーム' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ユーザー' })).toBeVisible();
    await expect(page.getByRole('link', { name: '商品' })).toBeVisible();
    await expect(page.getByRole('link', { name: '設定' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ヘルス' })).toBeVisible();
  });

  test('should display all implementation badges', async ({ page }) => {
    await page.goto('/');

    // Check all feature cards have "実装済み" badge
    const badges = page.getByText('実装済み');
    await expect(badges).toHaveCount(4);
  });
});