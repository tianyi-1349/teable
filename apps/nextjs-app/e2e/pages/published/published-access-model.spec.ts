import { expect, test } from '@playwright/test';

const previewPath = '/_monitor/preview/published-access-model';

test.describe('published access model preview', () => {
  test('keeps share, authenticated, and template boundary signals observable in a real browser', async ({
    page,
  }) => {
    await page.goto(previewPath);

    await expect(page.locator('body')).toContainText('Published Access Model Preview');

    await expect(page.getByTestId('share-mode')).toHaveText('share');
    await expect(page.getByTestId('share-default-node')).toHaveText('table-node');
    await expect(page.getByTestId('share-default-url')).toContainText(
      '/share/share-monitor/base/base-monitor/table/table-1'
    );
    await expect(page.getByTestId('share-readonly')).toHaveText('true');

    await expect(page.getByTestId('authenticated-mode')).toHaveText('authenticated');
    await expect(page.getByTestId('authenticated-default-node')).toHaveText('table-node');
    await expect(page.getByTestId('authenticated-active-url')).toContainText(
      '/base/base-monitor/app/app-1'
    );
    await expect(page.getByTestId('authenticated-readonly')).toHaveText('false');

    await expect(page.getByTestId('template-mode')).toHaveText('template');
    await expect(page.getByTestId('template-permalink')).toHaveText('/t/template-monitor');
    await expect(page.getByTestId('template-runtime-entry')).toHaveText('deferred');
    await expect(page.getByTestId('template-transport-path')).toHaveText('template-layout-active');
  });
});
