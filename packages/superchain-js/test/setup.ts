import { beforeAll } from 'vitest'
import { spawn } from 'child_process'
import { setTimeout } from 'timers/promises'
import { mkdirSync } from 'fs'
import { join } from 'path'

// Ensure logs directory exists
const logsDir = join(__dirname, '..', '.logs')
mkdirSync(logsDir, { recursive: true })

// Start supersim before tests
beforeAll(async () => {
    console.log('Starting supersim... (logs will be written to .logs/)')
    
    // Start supersim in the background with logging configured
    const supersim = spawn('supersim', [
        '--interop.autorelay',
        '--log.level=debug',
        `--logs.directory=${logsDir}`
    ], {
        stdio: 'ignore',
        shell: true
    })

    // Wait for supersim to start
    await setTimeout(5000)
    console.log('Supersim started successfully')

    // Clean up after tests
    return () => {
        supersim.kill()
    }
}) 