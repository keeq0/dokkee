import { test, expect } from '@playwright/test'

test.describe('Заметки', () => {
  test('создание новой заметки', async ({ page }) => {
    await page.goto('/documents')
    const initialCount = await page.locator('.notes__list .note').count()
    await page.locator('.notes__header .header__button').click()
    const newCount = await page.locator('.notes__list .note').count()
    expect(newCount).toBe(initialCount + 1)
  })
})