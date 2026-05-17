# Корневой Makefile монорепы dokkee
# Все команды можно запускать из корня репозитория.

SHELL := /bin/bash
COMPOSE := docker compose

# Включаем .env, если есть (для локальных перекрытий).
ifneq (,$(wildcard .env))
include .env
export
endif

.PHONY: help up down restart ps logs build clean \
        test test-backend test-frontend test-e2e \
        lint lint-backend lint-frontend lint-fix \
        migrate-up migrate-down migrate-create \
        seed \
        backend-shell frontend-shell

help: ## Показать это сообщение
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ------------------------------------------------------------------
# Compose lifecycle
# ------------------------------------------------------------------

up: ## Поднять весь стек (postgres + minio + backend + frontend + nginx)
	$(COMPOSE) up -d

down: ## Остановить весь стек
	$(COMPOSE) down

restart: down up ## Перезапустить весь стек

ps: ## Статус контейнеров
	$(COMPOSE) ps

logs: ## Логи всех сервисов (tail -f)
	$(COMPOSE) logs -f

build: ## Пересобрать образы
	$(COMPOSE) build

clean: ## Остановить и удалить тома (БД, MinIO)
	$(COMPOSE) down -v

# ------------------------------------------------------------------
# Tests
# ------------------------------------------------------------------

test: test-backend test-frontend ## Прогнать все тесты

test-backend: ## Прогнать тесты бэка (go test)
	cd backend && go test -race ./...

test-frontend: ## Прогнать unit-тесты фронта (vitest)
	cd frontend && npm run test:unit

test-e2e: ## Прогнать e2e-тесты фронта (Playwright). Стек должен быть поднят.
	cd frontend && npm run test:e2e

# ------------------------------------------------------------------
# Lint
# ------------------------------------------------------------------

lint: lint-backend lint-frontend ## Прогнать линтеры обеих частей

lint-backend:
	cd backend && go vet ./... && gofmt -l . | (! grep .)

lint-frontend:
	cd frontend && npm run lint

lint-fix: ## Автофиксы линтеров
	cd frontend && npm run lint:fix
	cd backend && gofmt -w .

# ------------------------------------------------------------------
# Migrations
# ------------------------------------------------------------------

migrate-up: ## Применить миграции БД
	$(COMPOSE) run --rm postgres-migrate -path /migrations -database "$$DATABASE_URL" up

migrate-down: ## Откатить одну миграцию
	$(COMPOSE) run --rm postgres-migrate -path /migrations -database "$$DATABASE_URL" down 1

migrate-create: ## Создать новую миграцию. Usage: make migrate-create seq=add_users_role
ifndef seq
	$(error Usage: make migrate-create seq=name)
endif
	$(COMPOSE) run --rm postgres-migrate create -ext sql -dir /migrations -seq "$(seq)"

# ------------------------------------------------------------------
# Seed (placeholder для PR-3)
# ------------------------------------------------------------------

seed: ## Seed суперадмина (реализация в PR-3)
	@echo "Seed суперадмина реализуется в PR-3"

# ------------------------------------------------------------------
# Shells
# ------------------------------------------------------------------

backend-shell:
	$(COMPOSE) exec backend sh

frontend-shell:
	$(COMPOSE) exec frontend sh
