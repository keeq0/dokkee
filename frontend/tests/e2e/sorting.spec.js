import { test, expect } from '@playwright/test'

test.describe('Сортировка документов', () => {
  test('сортировка по названию', async ({ page }) => {
    await page.goto('/documents')
    // Кликаем на фильтр в хранилище (первый .storage__filter на странице)
    const filter = page.locator('.storage__filter').first()
    await filter.click()
    // Внутри выпадающего списка ищем текст "названию (А-Я)" и кликаем
    await page.locator('.filter-options').getByText('названию (А-Я)', { exact: true }).click()
    // Проверяем, что значение фильтра изменилось
    await expect(filter.locator('.filter__value')).toHaveText('названию (А-Я)')
  })
})