import { test, expect } from './fixtures/auth.js'

test.describe('Auth flow', () => {
  test('login-success', async ({ page, loginPage }) => {
    await loginPage.goto()
    await loginPage.expectLoaded()
    await loginPage.fillAndSubmit({ username: 'e2e_user', password: 'e2e_pass' })
    await expect(page).toHaveURL(/\/app\/?$/)
    await expect(page.getByTestId('user-bar-username')).toContainText('e2e_user')
  })

  test('login-invalid', async ({ page, loginPage }) => {
    await loginPage.goto()
    await loginPage.expectLoaded()
    await loginPage.fillAndSubmit({ username: 'e2e_user', password: 'wrong' })
    await expect(loginPage.errorBlock).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('register-then-logout', async ({ page, registerPage }) => {
    const username = `e2e_new_${Date.now()}`
    await registerPage.goto()
    await registerPage.expectLoaded()
    await registerPage.fillAndSubmit({ username, password: 'e2e_pass' })
    await expect(page).toHaveURL(/\/app\/?$/)
    await page.getByTestId('user-bar-logout').click()
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/?$/)
  })

  test('guard-redirects-to-login', async ({ page }) => {
    await page.goto('/app/account')
    await expect(page).toHaveURL(/\/login\?next=%2Fapp%2Faccount/)
  })
})
