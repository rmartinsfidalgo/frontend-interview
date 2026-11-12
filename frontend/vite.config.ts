import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    clearMocks: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      '@apis': fileURLToPath(new URL('./src/services/apis', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@notifications': fileURLToPath(new URL('./src/notifications', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
    },
  },
})
