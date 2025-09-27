import { test, expect } from '@playwright/test';

test.describe('Primary Revenue Dashboard responsive layout', () => {
  test('mobile stacks three sections vertically', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Revenue Overview' })).toBeVisible();

    const cards = page.locator('text=Revenue Overview').locator('xpath=..').locator('..').locator('div.grid').locator('.chart-container');
    await expect(cards).toHaveCount(3);

    const boxes = await cards.evaluateAll((els) => els.map(e => e.getBoundingClientRect().top));
    expect(boxes[0]).toBeLessThan(boxes[1]);
    expect(boxes[1]).toBeLessThan(boxes[2]);
  });

  test('desktop shows three columns', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Revenue Overview' })).toBeVisible();
    const cards = page.locator('text=Revenue Overview').locator('xpath=..').locator('..').locator('div.grid').locator('.chart-container');
    await expect(cards).toHaveCount(3);

    const tops = await cards.evaluateAll((els) => els.map(e => e.getBoundingClientRect().top));
    // On wide viewport, first two should be on same row (similar top positions)
    expect(Math.abs(tops[0] - tops[1])).toBeLessThan(20);
  });
});

