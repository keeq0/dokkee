import { test, expect } from '@playwright/test'

test.describe('Хранилище документов', () => {
  test('переключение между плиткой и списком', async ({ page }) => {
    await page.goto('/documents')
    
    const tileButton = page.locator('.view__button').first()
    const listButton = page.locator('.view__button').last()
    
    await expect(tileButton).toBeVisible()
    await tileButton.click()
    await expect(page.locator('.tile-container')).toBeVisible()
    await listButton.click()
    await expect(page.locator('.list-container')).toBeVisible()
  })

  test('сортировка документов по имени', async ({ page }) => {
    await page.goto('/documents')
    // Открываем фильтр в хранилище (первый .storage__filter на странице)
    await page.locator('.storage__filter').first().click()
    // Выбираем опцию "названию (А-Я)" (используем first, так как в NotesFilter тоже есть такая опция)
    await page.locator('.filter-option').filter({ hasText: 'названию (А-Я)' }).first().click()
    // Проверяем, что значение фильтра в хранилище изменилось
    await expect(page.locator('.storage__filter').first().locator('.filter__value')).toHaveText('названию (А-Я)')
  })
})