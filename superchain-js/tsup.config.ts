import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  treeshake: true,
  minify: true,
  noExternal: ['viem'],
  platform: 'browser',
  target: 'es2020',
  env: {
    NODE_ENV: 'production'
  }
}) 