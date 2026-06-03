import { expect, test } from '@playwright/test';

const previewPath = '/_monitor/preview/published-business-flow';
const publishedViewText = 'Published view';
const readOnlyText = 'Read-only';
const businessTableContentText = 'business-table-content';
const businessAppContentText = 'business-app-content';
const currentModeTestId = 'current-mode';

test.describe('published business flow preview', () => {
  test('switches share, authenticated, and template runtime flows in a real browser', async ({
    page,
  }) => {
    await page.goto(previewPath);

    const shell = page.getByTestId('business-flow-preview-shell');
    const controls = page.getByTestId('business-flow-controls');

    await expect(page.locator('body')).toContainText('Published Business Flow Preview');
    await expect(page.getByTestId(currentModeTestId)).toHaveText('share');
    await expect(page.getByTestId('current-resource')).toHaveText('table');
    await expect(shell).toContainText(businessTableContentText);
    await expect(shell).toContainText(publishedViewText);
    await expect(shell).toContainText(readOnlyText);

    await controls
      .getByTestId('resource-app')
      .evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.getByTestId('current-resource')).toHaveText('app');
    await expect(shell).toContainText(businessAppContentText);
    await expect(shell).toContainText('Published app');
    await expect(shell).toContainText(readOnlyText);

    await controls
      .getByTestId('mode-authenticated')
      .evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.getByTestId(currentModeTestId)).toHaveText('authenticated');
    await expect(page.getByTestId('expected-flow')).toHaveText('authenticated-runtime');
    await expect(shell).toContainText(businessAppContentText);
    await expect(shell).toContainText(publishedViewText);
    await expect(shell).toContainText('Interactive');
    await expect(shell).toContainText('Save enabled');

    await controls
      .getByTestId('resource-table')
      .evaluate((button: HTMLButtonElement) => button.click());
    await controls
      .getByTestId('mode-template')
      .evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.getByTestId(currentModeTestId)).toHaveText('template');
    await expect(page.getByTestId('expected-flow')).toHaveText('template-runtime');
    await expect(shell).toContainText(businessTableContentText);
    await expect(shell).toContainText(publishedViewText);
    await expect(shell).toContainText(readOnlyText);
  });
});
