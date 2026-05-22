import { expect, test } from '@playwright/test';

const previewPath = '/_monitor/preview/grid-runtime';

test.describe('grid runtime preview', () => {
  test('keeps rendering and interaction signals observable in a real browser', async ({ page }) => {
    await page.goto(previewPath);

    await expect(page.locator('body')).toContainText('Grid Runtime Preview');
    await expect(page.getByTestId('grid-preview-shell')).toBeVisible();
    await expect(page.getByTestId('grid-client-state')).toHaveText('mounted');
    await expect(page.locator('[data-t-grid-stage]')).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(1);

    const stage = page.locator('[data-t-grid-stage]');
    const box = await stage.boundingBox();
    expect(box).not.toBeNull();
    if (box == null) {
      throw new Error('Grid stage bounding box is unavailable');
    }

    await stage.click({ position: { x: 150, y: 20 } });
    await expect(page.getByTestId('header-click-state')).not.toHaveText('none');

    await stage.dblclick({ position: { x: 150, y: 20 } });
    await expect(page.getByTestId('header-dblclick-state')).not.toHaveText('none');

    await stage.click({ position: { x: 150, y: 120 } });
    await expect(page.getByTestId('selection-state')).toContainText('Cells');

    await stage.click({ button: 'right', position: { x: 40, y: 40 } });
    await expect(page.getByTestId('group-menu-state')).toContainText('group-a');

    await page.getByTestId('scroll-target').click();
    await expect(page.getByTestId('scroll-state')).not.toHaveText('0,0');

    await page.getByTestId('read-bounds').click();
    await expect(page.getByTestId('bounds-state')).toContainText('"width"');
    await expect(page.getByTestId('visible-region-state')).not.toHaveText('none');
  });
});
