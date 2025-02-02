import { describe, it, expect } from 'vitest'
import { StandardSuperConfig } from '@superchain/js'

describe('StandardSuperConfig Integration', () => {
  it('should create config with multiple chains', () => {
    const config = new StandardSuperConfig({
      901: 'http://localhost:9545',
      902: 'http://localhost:9546'
    })

    expect(config.getChainIds()).toEqual([901, 902])
    expect(config.getRpcUrl(901)).toBe('http://localhost:9545')
    expect(config.getRpcUrl(902)).toBe('http://localhost:9546')
  })

  it('should throw error for unknown chain ID', () => {
    const config = new StandardSuperConfig({
      901: 'http://localhost:9545'
    })

    expect(() => config.getRpcUrl(999)).toThrow()
  })
}) 