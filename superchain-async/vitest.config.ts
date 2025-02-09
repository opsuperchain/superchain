import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: './test/setup.ts',
    setupFiles: []  // Remove setupFiles since we're using globalSetup
  }
}) 