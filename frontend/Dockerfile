# syntax=docker/dockerfile:1.6

# Базовый образ для приложения и unit-тестов.
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Dev-сервер с hot reload.
FROM deps AS dev
COPY . .
EXPOSE 8080
ENV CHOKIDAR_USEPOLLING=true \
    HOST=0.0.0.0
CMD ["npm", "run", "serve", "--", "--host", "0.0.0.0", "--port", "8080"]

# Vitest и lint - используют тот же node:20-alpine с уже установленными deps.
FROM deps AS test
COPY . .

# Отдельный образ для e2e: Playwright с уже установленными deps + сами тесты.
# Версия Playwright должна совпадать с pinned версией в package.json.
FROM mcr.microsoft.com/playwright:v1.49.0-jammy AS e2e
WORKDIR /e2e
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY playwright.config.js ./
COPY tests/e2e ./tests/e2e
ENV CI=1
CMD ["npx", "playwright", "test"]
