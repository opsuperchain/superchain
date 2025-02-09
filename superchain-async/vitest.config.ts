import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: './test/integration/setup.ts',
    setupFiles: []  // Remove setupFiles since we're using globalSetup
  }
}) 