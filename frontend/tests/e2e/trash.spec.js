import { test, expect } from '@playwright/test'

test.describe('Корзина', () => {
  test('открытие и закрытие модального окна', async ({ page }) => {
    await page.goto('/documents')
    await page.locator('.trash').click()
    await expect(page.locator('.trash-modal')).toBeVisible()
    await page.locator('.trash__exit').click()
    await expect(page.locator('.trash-modal')).toBeHidden()
  })
})