import { expect, test } from '@playwright/test';

test.describe('published route entries', () => {
  test('redirects unauthenticated base access into the real login route', async ({ page }) => {
    await page.goto('/base/base-e2e/table/tbl-e2e');

    await expect(page).toHaveURL(/\/auth\/login\?redirect=%2Fbase%2Fbase-e2e%2Ftable%2Ftbl-e2e/);
  });

  test('loads the real base share auth route without crashing', async ({ page }) => {
    await page.goto('/share/share-e2e/base/auth');

    await expect(page.getByTestId('share-auth-base-page')).toBeVisible();
    await expect(page.getByTestId('share-id-state')).toHaveText('share-e2e');
  });

  test('loads the real view share auth route without crashing', async ({ page }) => {
    await page.goto('/share/share-e2e/view/auth');

    await expect(page.getByTestId('share-auth-view-page')).toBeVisible();
    await expect(page.getByTestId('share-id-state')).toHaveText('share-e2e');
  });
});
