import { test, expect } from '@playwright/test'

const MOCK_ANSWER = `## Отчёт

### Раздел 1
Текст отчёта.

### Раздел 2
- пункт 1
- пункт 2

<!--RISKS-->
[
  {
    "level": "Большие риски",
    "name": "Штраф 1М",
    "quote": "образец цитаты",
    "comment": "Слишком высокая фиксированная сумма",
    "recommendations": ["Снизить", "Привязать к проценту"]
  },
  {
    "level": "Хорошо",
    "name": "Чёткие сроки",
    "quote": "сроки поставки",
    "comment": "Чёткая формулировка",
    "recommendations": []
  }
]
<!--/RISKS-->`

async function mockDeepseek(page) {
  await page.route('**/api.deepseek.com/chat/completions', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ choices: [{ message: { content: MOCK_ANSWER } }] })
    })
  })
}

test.describe('AnalysisResult: новые фичи', () => {
  test('начальное состояние: AnalysisResult виден, кнопки disabled, статус-плейсхолдер', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.analysis')).toBeVisible()
    await expect(page.locator('.progress__status')).toHaveText('Ожидаю…')
    await expect(page.locator('.bar__percentage')).toHaveText('0%')
    const buttons = page.locator('.panel__button')
    await expect(buttons).toHaveCount(3)
    for (let i = 0; i < 3; i++) {
      await expect(buttons.nth(i)).toBeDisabled()
    }
  })

  test('font-size popover открывается, изменение применяет --preview-font-scale', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.font-size-popover')).toHaveCount(0)
    await page.locator('.analysis__font-size-selector').click()
    await expect(page.locator('.font-size-popover')).toBeVisible()

    const slider = page.locator('.font-size-popover__slider')
    await slider.fill('150')
    await expect(page.locator('.font-size-selector__size')).toHaveText('150%')
    const style = await page.locator('.content__document').getAttribute('style')
    expect(style || '').toContain('--preview-font-scale: 1.5')

    await page.locator('.font-size-popover__reset').click()
    await expect(page.locator('.font-size-selector__size')).toHaveText('100%')
  })

  test('после анализа: progress=100, статус "Анализ завершён", кнопки активны', async ({ page }) => {
    await mockDeepseek(page)
    await page.goto('/')
    await page
      .locator('.drop-menu__zone input[type="file"]')
      .setInputFiles('./tests/e2e/fixtures/sample.pdf')
    await page.locator('.agreement__checkbox').check()
    await page.locator('.upload__start').click()
    await page.locator('.prompt-modal__btn--primary').click()

    await expect(page.locator('.progress__status')).toHaveText('Анализ завершён', { timeout: 90000 })
    await expect(page.locator('.bar__percentage')).toHaveText('100%')
    const buttons = page.locator('.panel__button')
    await expect(buttons.nth(0)).toBeEnabled()
    await expect(buttons.nth(1)).toBeEnabled()
    await expect(buttons.nth(2)).toBeEnabled()
  })

  test('risk-panel: после анализа отображает группы рисков по уровням', async ({ page }) => {
    await mockDeepseek(page)
    await page.goto('/')
    await page
      .locator('.drop-menu__zone input[type="file"]')
      .setInputFiles('./tests/e2e/fixtures/sample.pdf')
    await page.locator('.agreement__checkbox').check()
    await page.locator('.upload__start').click()
    await page.locator('.prompt-modal__btn--primary').click()

    await expect(page.locator('.progress__status')).toHaveText('Анализ завершён', { timeout: 90000 })
    await expect(page.locator('.risk-panel__group--danger')).toContainText('Большие риски (1)')
    await expect(page.locator('.risk-panel__group--good')).toContainText('Хорошо (1)')
    await expect(page.locator('.risk-panel__item').first()).toContainText('Штраф 1М')
  })

  test('кнопка "Скачать отчёт" триггерит скачивание PDF', async ({ page }) => {
    await mockDeepseek(page)
    await page.goto('/')
    await page
      .locator('.drop-menu__zone input[type="file"]')
      .setInputFiles('./tests/e2e/fixtures/sample.pdf')
    await page.locator('.agreement__checkbox').check()
    await page.locator('.upload__start').click()
    await page.locator('.prompt-modal__btn--primary').click()

    await expect(page.locator('.progress__status')).toHaveText('Анализ завершён', { timeout: 90000 })
    await page.locator('.assistant__close').click()
    await expect(page.locator('.assistant.assistant--visible')).toHaveCount(0)

    const downloadButton = page.locator('.panel__button.save').nth(1)
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 })
    await downloadButton.click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/^report-.*\.pdf$/)
  })
})
