import { test, expect } from '@playwright/test'

test.describe('Аналитика', () => {
  test('открывается страница аналитики', async ({ page }) => {
    await page.goto('/app/analysis')
    await expect(page.getByRole('heading', { name: 'Статистика и аналитика' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Анализ моих документов' })).toBeVisible()
  })
})