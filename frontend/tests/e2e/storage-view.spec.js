import { test, expect } from '@playwright/test'

test.describe('Переключение вида документов', () => {
  test('плитка и список работают', async ({ page }) => {
    await page.goto('/documents')
    
    // Находим кнопки переключения вида по их классам (не по картинкам)
    const tileButton = page.locator('.view__button').first()
    const listButton = page.locator('.view__button').last()
    
    await expect(tileButton).toBeVisible()
    
    // Клик на плитку (убеждаемся, что она активна)
    await tileButton.click()
    await expect(page.locator('.tile-container')).toBeVisible()
    
    // Клик на список
    await listButton.click()
    await expect(page.locator('.list-container')).toBeVisible()
  })
})