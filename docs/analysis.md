# Анализ исходных репозиториев

Дата: 2026-05-17.
Issue: keeq0/dokkee#1, раздел 1.

## dockee-landing

- Stack: Vue 3 + vue-cli, plain JS (без TypeScript), без Pinia, без vue-router
- Структура: `src/App.vue`, `src/main.js`, `src/components/`, `src/assets/`
- Не использует backend
- Кнопка "Вход" в шапке: есть, но без обработчика - ведёт в никуда
- Build: `npm run build` -> статика
- Тесты: нет

В монорепе становится: набор views и компонентов в `frontend/src/views/landing/`, маршрут `/`. Перенос - в PR-2.

## dokkee-front (внутри package.json - "docscheck")

- Stack: Vue 3 + Pinia + vue-router + axios + Vitest + Playwright + vue-cli
- DeepSeek: использует `openai` JS-клиент напрямую из браузера, ключ через `VUE_APP_DEEPSEEK_KEY`
- Структура views: MainPage, DocumentPage, AnalysisPage, AccountPage
- Stores: только `documents.js`
- Services: `deepseek.js`, `highlight.js`, `reportExport.js`, `risks.js`
- Helpers: разные утилиты
- Router: 4 публичных роута без guards
- Auth: отсутствует (нет LoginPage, axios без interceptor)
- Тесты: unit (vitest) и e2e (Playwright) - есть, проходят
- Артефакты в репо: ~3 МБ PNG-скриншотов багов прошлых issue, тестовый .docx ~37 МБ

В монорепе становится: `frontend/` (после переименования package в `dokkee-frontend`). Все маршруты сдвигаются под `/app/*` в PR-2. Auth и переключение DeepSeek на backend - в PR-5.

## dokkee-backend

- Stack: Go 1.25 + Gin + sqlx + Postgres 18 + MinIO + JWT (dgrijalva) + Viper + logrus
- Архитектура: чистая трёхслойка handler -> service -> repository
- Auth: sign-up, sign-in, JWT middleware (bcrypt, токен в Authorization header)
- Domain: User, Profile, Document, Result, Audit
- AI: `service/ai_connector.go` - вызов DeepSeek с mock-fallback, `service/ner.go` - анонимизация ПД
- MinIO: загрузка документов через `repository/s3.go`
- Миграции: 5 штук (000001_init, 000002_profiles, 000003_documents, 000004_results, 000005_audit)
- Тесты: unit на сервисы и handlers (mocks), integration на репозитории (живая Postgres)
- env (placeholder): `AI_API_URL`, `AI_API_KEY`, `AI_MODEL` - то есть бэк уже готов работать с DeepSeek через свой ключ

В монорепе становится: `backend/` с переименованным Go module path `github.com/keeq0/dokkee/backend`.

## Связи между проектами

- Лендинг сейчас ни с кем не связан. Кнопка "Вход" должна вести в основное приложение через страницу логина.
- Фронт сейчас бьёт прямо в DeepSeek (ключ в браузере) и не использует свой backend для анализа.
- Бэк уже умеет принимать документ, обезличивать, анализировать и хранить результат - всё, что нужно фронту, уже доступно по API.

## Несоответствия и недостающее

| Что | Где не хватает | Где есть | Куда делаем |
|---|---|---|---|
| Auth UI (login/register) | dokkee-front | dokkee-backend (sign-up/sign-in) | PR-5: фронтовая страница + axios interceptor |
| Cookie-based auth | оба | - (сейчас Bearer header) | PR-3: бэк отдаёт JWT в `Set-Cookie` HttpOnly |
| Роли | dokkee-backend | - | PR-3: миграция `000006_user_roles` |
| Seed суперадмина | dokkee-backend | - | PR-3: `cmd/seed/main.go` |
| Админка | оба | - | PR-4: backend `/api/admin/*` + frontend `/admin/*` |
| Soft-delete пользователей | dokkee-backend | - | PR-4: миграция `000007_users_soft_delete` |
| Перенос DeepSeek на бэк | dokkee-front | - | PR-5: удаление `services/deepseek.js`, использование `/api/documents` |
| Лендинг как routes | оба | dockee-landing | PR-2: views/landing + маршрут `/` |
| Единый стиль | все три | - | PR-7: design tokens, согласование |
| CI/CD | dokkee-front имеет .github, бэк имеет .github | systemburo как эталон | PR-6 |
| README единый | - | - | PR-7 |

## Конфиги, которые должны быть общими

- `.env` - один на корне (заменяет два разных в исходных репозиториях)
- Docker-compose - один на корне с merged-сервисами (postgres, minio, backend, frontend, nginx)
- CI workflows - один набор в `.github/workflows/`

## Известные нюансы

- `frontend/vue.config.js` содержит дубль `module.exports = ...` (второй переопределяет первый). Чистим в PR-2 или PR-7, чтобы не смешивать с импортом.
- `frontend/vue.config.js` имеет `publicPath: '/dokkee-front/'` в production - неверно для новой структуры (нужно `/`). Правим в PR-2.
- `dokkee-backend/.env example` (с пробелом в имени) переименован в `.env.example` при импорте.
- Хардкод старого Go module path `github.com/airvt1x/dokkee-backend` заменён на `github.com/keeq0/dokkee/backend` в 36 файлах при импорте.
