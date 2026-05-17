import { test, expect } from '@playwright/test'

test.describe('Главная страница', () => {
  test('открывается и показывает заголовок "Загрузка документов"', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Загрузка документов' })).toBeVisible()
  })

  test('содержит панель навигации с пунктами Главная, Документы, Аналитика, Аккаунт', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('.navigation')
    await expect(nav).toBeVisible()
    await expect(nav.getByText('Главная', { exact: true })).toBeVisible()
    await expect(nav.getByText('Документы', { exact: true })).toBeVisible()
    await expect(nav.getByText('Аналитика', { exact: true })).toBeVisible()
    await expect(nav.getByText('Аккаунт', { exact: true })).toBeVisible()
  })
})
