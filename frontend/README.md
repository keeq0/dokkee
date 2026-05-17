# Dockee (фронтенд)

Сервис проверки и анализа документов на Vue 3 + Pinia.
Бэкенда нет: прогресс и стриминг ответа ИИ эмулируются на клиенте, обращение к DeepSeek идёт напрямую из браузера.

## Установка и запуск

```bash
npm install
cp .env.example .env   # проставить VUE_APP_DEEPSEEK_KEY
npm run serve
```

Сборка production-бандла:

```bash
npm run build
```

## Переменные окружения

| Переменная | Описание |
|---|---|
| `VUE_APP_DEEPSEEK_KEY` | API-ключ DeepSeek (https://platform.deepseek.com/). Без него анализ упадёт с понятной ошибкой. |
| `CHOKIDAR_USEPOLLING` | `true` для работы webpack-dev-server в Docker-volume. |
| `HOST` / `PORT` | Адрес dev-сервера внутри контейнера. |
| `BASE_URL` | Базовый URL для Playwright (по умолчанию `http://localhost:8080`). |

`.env` в `.gitignore`. Реальный ключ DeepSeek в репозиторий не коммитится.

## Поддерживаемые форматы документов

- `PDF` — превью через `pdfjs-dist` (canvas-рендер), извлечение текста для анализа.
- `DOCX` — превью через `mammoth` (HTML с сохранением заголовков, списков, таблиц, картинок), текст selectable.
- `.doc` (бинарный) **не поддерживается** — конверсия требует серверной части, которой нет. UI отклоняет с подсказкой пересохранить в `.docx`.

## Архитектура

```
src/
  views/MainPage.vue         - корневой view: UploadDocuments, AnalysisResult, AiAssistant, PromptSettingsModal
  components/
    AnalysisResult.vue       - превью документа, file-selector, прогресс, риски, кнопки
    AiAssistant.vue          - чат с ИИ, PDF-экспорт отчёта
    PromptSettingsModal.vue  - модалка чекбоксов перед запуском анализа
    UploadDocuments.vue      - загрузка файлов в стор
  services/
    deepseek.js              - единая обёртка над axios для DeepSeek API
    risks.js                 - промпт анализа + парсер JSON-блока рисков
    reportExport.js          - markdown -> HTML -> PDF (html2pdf.js)
  composables/
    useAnalysisProgress.js   - эмуляция стадий 0 -> 99% со случайной задержкой
    useStreamingText.js      - посимвольный вывод ответа ИИ
  stores/
    documents.js             - Pinia store: per-document state (url, status, progress,
                               extractedText, htmlPreview, analysisResult, risks,
                               pinnedRisk, chatHistory)
```

## Тесты

```bash
npm run lint
npm run test:unit          # vitest
npm run test:e2e           # playwright (нужен запущенный dev-сервер на BASE_URL)
```

E2E мокают DeepSeek через `page.route('**/api.deepseek.com/...')`.

## Безопасность

- Старый ключ DeepSeek (`sk-95a2138d...`), который был в первых коммитах, скомпрометирован. Если используете живой ключ, не забудьте отозвать его в личном кабинете DeepSeek.
- Историю репозитория мы не переписываем — после клонирования ключ можно увидеть в `git log` ранних коммитов. Это известный известный технический долг.
