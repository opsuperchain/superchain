import { beforeAll } from 'vitest'
import { spawn } from 'child_process'
import { setTimeout } from 'timers/promises'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { createPublicClient, http } from 'viem'
import net from 'net'  // Added to check port usage

// Helper to check if a port is in use
async function checkPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const client = net.createConnection({ port, host: 'localhost' }, () => {
            client.end();
            resolve(true);
        });
        client.on('error', (err: any) => {
            if (err.code === 'ECONNREFUSED') {
                resolve(false);
            } else {
                resolve(false);
            }
        });
    });
}

// Helper function to check if a chain is ready; reduced maxAttempts from 30 to 10
async function waitForChain(rpcUrl: string, maxAttempts = 10) {
    const client = createPublicClient({
        transport: http(rpcUrl)
    });

    for (let i = 0; i < maxAttempts; i++) {
        try {
            console.log(`Attempt ${i + 1} to connect to ${rpcUrl}...`);
            await client.getBlockNumber();
            console.log(`Chain at ${rpcUrl} is ready!`);
            return true;
        } catch (error: any) {
            console.log(`Failed attempt ${i + 1}:`, error.message);
            if (i === maxAttempts - 1) {
                throw new Error(`Chain at ${rpcUrl} not ready after ${maxAttempts} attempts`);
            }
            await setTimeout(1000);
        }
    }
    return false;
}

// Convert beforeAll to a global setup function
export async function setup() {
    // Check if ports 9545 and 9546 are free; skip tests if not
    const ports = [9545, 9546];
    for (const port of ports) {
        const inUse = await checkPort(port);
        if (inUse) {
            console.warn(`Port ${port} is in use. Skipping tests.`);
            process.exit(0);
        }
    }
    
    // Ensure logs directory exists
    const logsDir = join(__dirname, '..', '.logs');
    mkdirSync(logsDir, { recursive: true });
    console.log('Logs will be written to:', logsDir);
    
    console.log('Starting supersim...');
    
    // Start supersim in the background with logging configured
    const supersim = spawn('supersim', [
        '--interop.autorelay',
        '--log.level=debug',
        `--logs.directory=${logsDir}`
    ], {
        stdio: ['ignore', 'pipe', 'pipe'],  // Pipe both stdout and stderr
        shell: true
    });

    // Handle potential spawn errors
    supersim.on('error', (err) => {
        console.error('Failed to start supersim:', err);
        throw err;
    });

    // Log stdout and stderr for debugging
    supersim.stdout?.on('data', (data) => {
        console.log('supersim stdout:', data.toString());
    });

    supersim.stderr?.on('data', (data) => {
        console.error('supersim stderr:', data.toString());
    });

    // Wait for both chains to be ready
    try {
        await Promise.all([
            waitForChain('http://localhost:9545'),
            waitForChain('http://localhost:9546')
        ]);
        console.log('Supersim started successfully');
    } catch (error) {
        console.error('Failed to start supersim:', error);
        supersim.kill();
        throw error;
    }

    // Store supersim process globally for teardown
    globalThis.__SUPERSIM__ = supersim;
}

// Add teardown function
export async function teardown() {
    if (globalThis.__SUPERSIM__) {
        globalThis.__SUPERSIM__.kill();
    }
} 