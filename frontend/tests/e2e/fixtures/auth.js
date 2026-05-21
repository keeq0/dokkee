import { test as base, expect } from '@playwright/test'
import { LoginPagePOM, RegisterPagePOM } from '../pom/AuthPages.js'

const harDir = 'tests/e2e/har'
const updateHar = process.env.E2E_UPDATE_HAR === '1'

export const test = base.extend({
  apiMock: [async ({ page }, use, testInfo) => {
    const safeTitle = testInfo.title.replace(/[^a-zA-Z0-9_-]/g, '_')
    const harFile = `${harDir}/auth-${safeTitle}.har`
    await page.routeFromHAR(harFile, {
      update: updateHar,
      url: /\/(api|auth)\//
    })
    await use()
  }, { auto: true }],

  loginPage: async ({ page }, use) => {
    const pom = new LoginPagePOM(page)
    await use(pom)
  },

  registerPage: async ({ page }, use) => {
    const pom = new RegisterPagePOM(page)
    await use(pom)
  }
})

export { expect }
