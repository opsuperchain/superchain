import { beforeAll } from 'vitest'
import { spawn } from 'child_process'
import { setTimeout } from 'timers/promises'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { createPublicClient, http } from 'viem'

// Helper function to check if a chain is ready
async function waitForChain(rpcUrl: string, maxAttempts = 30) {
    const client = createPublicClient({
        transport: http(rpcUrl)
    })

    for (let i = 0; i < maxAttempts; i++) {
        try {
            await client.getBlockNumber()
            return true
        } catch (error: any) {
            if (i === maxAttempts - 1) {
                throw new Error(`Chain at ${rpcUrl} not ready after ${maxAttempts} attempts`)
            }
            await setTimeout(1000)
        }
    }
    return false
}

// Start supersim before tests
beforeAll(async () => {
    // Ensure logs directory exists
    const logsDir = join(__dirname, '..', '.logs')
    mkdirSync(logsDir, { recursive: true })
    console.log('Logs will be written to:', logsDir)
    
    console.log('Starting supersim...')
    
    // Start supersim in the background with logging configured
    const supersim = spawn('supersim', [
        '--interop.autorelay',
        '--log.level=debug',
        `--logs.directory=${logsDir}`
    ], {
        stdio: ['ignore', 'ignore', 'pipe'],  // Only pipe stderr
        shell: true
    })

    // Handle potential spawn errors
    supersim.on('error', (err) => {
        console.error('Failed to start supersim:', err)
        throw err
    })

    // Log stderr for debugging
    supersim.stderr?.on('data', (data) => {
        console.error('supersim error:', data.toString())
    })

    // Wait for both chains to be ready
    try {
        await Promise.all([
            waitForChain('http://localhost:9545'),
            waitForChain('http://localhost:9546')
        ])
        console.log('Supersim started successfully')
    } catch (error) {
        supersim.kill()
        throw error
    }

    // Clean up after tests
    return () => {
        supersim.kill()
    }
}, 60000)  // 60 second timeout 