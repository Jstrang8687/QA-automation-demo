import { test, expect } from '@playwright/test';

test('search Wikipedia for Green Bay Packers', async ({ page }) => {
    await page.goto('https://en.wikipedia.org');

    await page.getByRole('searchbox', { name: 'Search Wikipedia' }).click();
    await page.getByRole('searchbox', { name: 'Search Wikipedia' }).fill('GreenBay Packers');
    await page.getByRole('button', { name: 'Search ' }).click();

    await expect(page.getByRole('heading', { name: 'Green Bay Packers', level: 1 })).toBeVisible();
});