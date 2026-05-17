import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.spec.js'],
    setupFiles: ['./tests/setup.js'],
    moduleNameMapper: {
      '\\.(png|jpg|jpeg|svg|gif)$': '<rootDir>/tests/__mocks__/fileMock.js'
    },
    coverage: {
    provider: 'v8',
    reporter: ['text', 'html'],
    include: ['src/**/*.{js,vue}'],
    exclude: ['src/main.js', 'src/router/index.js']
  }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})