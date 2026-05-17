import { test, expect } from '@playwright/test'

test.describe('Навигация по разделам', () => {
  test('переход в "Документы" открывает /documents с заголовком "Мои документы"', async ({ page }) => {
    await page.goto('/')
    await page.locator('.navigation').getByText('Документы', { exact: true }).click()
    await expect(page).toHaveURL(/\/documents$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Мои документы' })).toBeVisible()
  })

  test('переход в "Аналитика" открывает /analysis с двумя h1', async ({ page }) => {
    await page.goto('/')
    await page.locator('.navigation').getByText('Аналитика', { exact: true }).click()
    await expect(page).toHaveURL(/\/analysis$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Статистика и аналитика' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: 'Анализ моих документов' })).toBeVisible()
  })

  test('переход в "Аккаунт" открывает /account с заголовком "Мой аккаунт"', async ({ page }) => {
    await page.goto('/')
    await page.locator('.navigation').getByText('Аккаунт', { exact: true }).click()
    await expect(page).toHaveURL(/\/account$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Мой аккаунт' })).toBeVisible()
  })

  test('возврат в "Главная" возвращает на /', async ({ page }) => {
    await page.goto('/documents')
    await page.locator('.navigation').getByText('Главная', { exact: true }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Загрузка документов' })).toBeVisible()
  })
})
