import { createPublicClient, createWalletClient, http, Chain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

// Test accounts with known private keys (from Anvil)
const PRIVATE_KEY_A = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const PRIVATE_KEY_B = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

// Chain configurations
export const chainA: Chain = {
    id: 901,
    name: 'Chain A',
    network: 'superchain-a',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: { http: ['http://localhost:9545'] },
        public: { http: ['http://localhost:9545'] },
    },
}

export const chainB: Chain = {
    id: 902,
    name: 'Chain B',
    network: 'superchain-b',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: { http: ['http://localhost:9546'] },
        public: { http: ['http://localhost:9546'] },
    },
}

// Create wallet and public clients
export const walletA = createWalletClient({
    account: privateKeyToAccount(PRIVATE_KEY_A as `0x${string}`),
    chain: chainA,
    transport: http()
})

export const walletB = createWalletClient({
    account: privateKeyToAccount(PRIVATE_KEY_B as `0x${string}`),
    chain: chainB,
    transport: http()
})

export const clientA = createPublicClient({
    chain: chainA,
    transport: http()
})

export const clientB = createPublicClient({
    chain: chainB,
    transport: http()
})

// Helper to deploy contract and get instance
export async function deployAndGetContract(
    contractJson: any,
    args: any[],
    wallet: any,
    client: any
) {
    const hash = await wallet.deployContract({
        abi: contractJson.abi,
        bytecode: contractJson.bytecode as `0x${string}`,
        args
    })

    const receipt = await client.waitForTransactionReceipt({ hash })
    if (!receipt.contractAddress) throw new Error('Contract deployment failed')

    return {
        abi: contractJson.abi,
        address: receipt.contractAddress as `0x${string}`,
        write: {
            makeAsyncCallAndStore: async (args: any[]) => {
                const hash = await wallet.writeContract({
                    address: receipt.contractAddress as `0x${string}`,
                    abi: contractJson.abi,
                    functionName: 'makeAsyncCallAndStore',
                    args
                })
                return client.waitForTransactionReceipt({ hash })
            }
        },
        read: {
            lastValueReturned: async () => {
                return client.readContract({
                    address: receipt.contractAddress as `0x${string}`,
                    abi: contractJson.abi,
                    functionName: 'lastValueReturned'
                })
            }
        }
    }
}

// Helper to sleep for a given number of milliseconds
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)) 