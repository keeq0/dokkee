import { test, expect } from '@playwright/test'

test.describe('Аккаунт', () => {
  test('открывается страница аккаунта', async ({ page }) => {
    await page.goto('/app/account')
    await expect(page.getByRole('heading', { name: 'Мой аккаунт' })).toBeVisible()
  })
})