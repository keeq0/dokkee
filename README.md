# dokkee

Сервис анализа документов. Монорепозиторий: лендинг + основное приложение + backend.

## Состав

```
dokkee/
├── frontend/         Vue 3 SPA (лендинг + приложение + админка)
├── backend/          Go API (Gin + Postgres + MinIO + JWT)
├── nginx/            reverse-proxy для локального запуска
├── docs/             документация и аналитика
├── docker-compose.yml
└── Makefile          единая точка входа
```

## Требования

- Docker 24+ и Docker Compose v2
- Make
- (для разработки вне Docker) Go 1.25+, Node.js 20+, npm 10+

## Быстрый старт

```bash
cp .env.example .env       # потом отредактируй значения под себя
make up                    # поднять стек
make ps                    # проверить статус
```

После `make up` через ~30 секунд:

- Веб-приложение: http://localhost:8085
- MinIO console: http://localhost:9001 (логин/пароль из .env)
- Postgres: localhost:5433 (логин/пароль из .env)

## Переменные окружения

См. `.env.example` для полного списка. Ключевые:

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` - креденшелы БД
- `sign_key` - секрет для JWT (обязательно сменить в проде)
- `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET` - MinIO
- `AI_API_URL`, `AI_API_KEY`, `AI_MODEL` - DeepSeek; оставь пустыми для mock-режима

## Команды

```bash
make help              # список всех целей
make up / down         # запуск / остановка стека
make ps / logs         # статус / логи
make test              # все тесты (backend + frontend)
make lint              # все линтеры
make migrate-up        # применить миграции БД
make migrate-down      # откатить одну миграцию
make seed              # seed суперадмина (PR-3)
make clean             # удалить тома (БД, MinIO)
```

## Структура PR-плана

Объединение проекта идёт серией атомарных PR. Подробнее: docs/analysis.md.

- PR-1 (текущий): каркас монорепы + импорт frontend и backend
- PR-2: лендинг как routes
- PR-3: роли, JWT в cookie, seed суперадмина, /me, /logout
- PR-4: админка (user CRUD + audit viewer)
- PR-5: Login/Register UI, axios+JWT, перенос DeepSeek на backend
- PR-6: тесты + CI/CD
- PR-7: единый стиль + полный README

## Разработка

Подробная документация и пошаговые инструкции появятся в PR-7. Сейчас:

- Бэк: `cd backend && go test ./...`
- Фронт: `cd frontend && npm ci && npm test`

Issue: https://github.com/keeq0/dokkee/issues/1
