import { test, expect } from '@playwright/test'

test.describe('Загрузка документов', () => {
  test('пользователь может загрузить файл через DropMenu', async ({ page }) => {
    await page.goto('/')
    const fileInput = page.locator('.drop-menu__zone input[type="file"]')
    await fileInput.setInputFiles('./tests/e2e/fixtures/sample.pdf')
    await expect(page.locator('.upload-documents__file-name')).toContainText('sample.pdf')
  })

  test('нажатие "Запустить проверку" открывает модалку промпта, затем ИИ-помощника', async ({ page }) => {
    await page.route('**/api.deepseek.com/chat/completions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          choices: [
            {
              message: {
                content:
                  'Моковый анализ. Документ в порядке.\n\n<!--RISKS-->\n[]\n<!--/RISKS-->'
              }
            }
          ]
        })
      })
    })

    await page.goto('/')
    const fileInput = page.locator('.drop-menu__zone input[type="file"]')
    await fileInput.setInputFiles('./tests/e2e/fixtures/sample.pdf')
    await page.locator('.agreement__checkbox').check()
    await page.locator('.upload__start').click()

    const modal = page.locator('.prompt-modal')
    await expect(modal).toBeVisible()
    await expect(modal.locator('.prompt-modal__title')).toHaveText('Настройка анализа')
    await expect(modal.locator('.prompt-modal__checkbox')).toHaveCount(5)

    await modal.locator('.prompt-modal__btn--primary').click()
    await expect(modal).not.toBeVisible()

    await expect(page.locator('.assistant')).toBeVisible({ timeout: 30000 })
    await expect(page.locator('.assistant__second-message')).toBeVisible({ timeout: 60000 })
  })

  test('"Отмена" в модалке закрывает её без запуска анализа', async ({ page }) => {
    await page.goto('/')
    await page
      .locator('.drop-menu__zone input[type="file"]')
      .setInputFiles('./tests/e2e/fixtures/sample.pdf')
    await page.locator('.agreement__checkbox').check()
    await page.locator('.upload__start').click()

    const modal = page.locator('.prompt-modal')
    await expect(modal).toBeVisible()
    await modal.locator('.prompt-modal__btn').first().click()
    await expect(modal).not.toBeVisible()
    await expect(page.locator('.assistant')).toHaveCount(0)
  })
})
