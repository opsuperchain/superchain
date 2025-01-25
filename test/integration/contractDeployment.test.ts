import { Wallet } from '../../src/wallet'
import { getXContract } from '../../src/contractFactory'
import { createPublicClient, http, parseEther, createWalletClient, Chain, Account } from 'viem'
import { describe, it, expect, beforeAll } from '@jest/globals'

// Test contract ABI and bytecode
const TEST_CONTRACT_ABI = [
  {
    type: 'function' as const,
    name: 'x',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view' as const
  }
] as const;

// This is the CREATE2 factory's own test contract
const TEST_CONTRACT_BYTECODE = '0x6080604052348015600f57600080fd5b5060878061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80630c55699c14602d575b600080fd5b60336047565b604051603e91906064565b60405180910390f35b60005481565b6000819050919050565b605e81604d565b82525050565b6000602082019050607760008301846057565b9291505056fea264697066735822122088d08f04355df6fb4e9735d04ed90c2c1a0c0e5c5c6f0a6c6c0d7ff1f5823d3164736f6c63430008070033' as `0x${string}`

describe('Contract Deployment Integration', () => {
  const ANVIL_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  const ANVIL_CHAIN_ID = 31337
  const ANVIL_RPC_URL = 'http://localhost:8545'

  let isAnvilRunning = false
  let hasBalance = false
  let publicClient: ReturnType<typeof createPublicClient>
  let walletClient: ReturnType<typeof createWalletClient>
  let account: Account

  const anvilChain = {
    id: ANVIL_CHAIN_ID,
    name: 'Anvil',
    network: 'anvil',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: [ANVIL_RPC_URL] },
      public: { http: [ANVIL_RPC_URL] },
    },
  } as const

  // Check if Anvil is running and account has balance
  beforeAll(async () => {
    try {
      publicClient = createPublicClient({
        chain: anvilChain,
        transport: http(ANVIL_RPC_URL)
      })

      const wallet = new Wallet(ANVIL_PRIVATE_KEY)
      account = wallet.getAccount()
      const balance = await publicClient.getBalance({ address: account.address })
      
      isAnvilRunning = true
      hasBalance = balance >= parseEther('1')

      // Create wallet client for direct deployment
      walletClient = createWalletClient({
        chain: anvilChain,
        transport: http(ANVIL_RPC_URL),
        account
      })
    } catch (error) {
      console.log('Anvil not running or other setup issue:', error)
    }
  })

  it('should deploy and interact with contract directly (without CREATE2)', async () => {
    // Skip if preconditions not met
    if (!isAnvilRunning) {
      console.log('Skipping test: Anvil not running')
      return
    }
    if (!hasBalance) {
      console.log('Skipping test: Test account has insufficient balance')
      return
    }

    // Deploy contract directly
    console.log('Deploying contract directly...')
    const hash = await walletClient.deployContract({
      abi: TEST_CONTRACT_ABI,
      bytecode: TEST_CONTRACT_BYTECODE,
      chain: anvilChain,
      account
    })

    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log('Direct deployment receipt:', receipt)

    expect(receipt.status).toBe('success')
    expect(receipt.contractAddress).toBeDefined()

    if (!receipt.contractAddress) {
      throw new Error('No contract address in receipt')
    }

    // Test contract interaction
    console.log('Testing contract interaction...')
    
    // Get value (should be 0 initially)
    const value = await publicClient.readContract({
      address: receipt.contractAddress,
      abi: TEST_CONTRACT_ABI,
      functionName: 'x',
    })

    console.log('Retrieved value:', value?.toString())
    expect(value).toBe(0n)
    console.log('Contract interaction successful')
  }, 30000)
}) 