import { SuperWallet } from '../../src/SuperWallet'
import { SuperContract } from '../../src/SuperContract'
import { StandardSuperRPC } from '../../src/SuperRPC'
import { createPublicClient, createWalletClient, http, parseEther, Account, Chain } from 'viem'

// Test contract ABI and bytecode
const TEST_CONTRACT_ABI = [
  {
    type: 'constructor' as const,
    inputs: [{ type: 'uint256', name: '_initialValue' }],
    stateMutability: 'nonpayable' as const
  },
  {
    type: 'function' as const,
    name: 'x',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view' as const
  },
  {
    type: 'function' as const,
    name: 'setX',
    inputs: [{ type: 'uint256', name: '_x' }],
    outputs: [],
    stateMutability: 'nonpayable' as const
  }
] as const;

// This is the compiled bytecode from our TestContract.sol
const TEST_CONTRACT_BYTECODE = '0x608060405234801561001057600080fd5b5060405161010f38038061010f83398101604081905261002f91610037565b600055610050565b60006020828403121561004957600080fd5b5051919050565b60b18061005e6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80630c55699c1460375780634018d9aa146051575b600080fd5b603f60005481565b60405190815260200160405180910390f35b6061605c3660046063565b600055565b005b600060208284031215607457600080fd5b503591905056fea264697066735822122034362d374f123dbd53fa899d12d79e6a4339cc81cc43fca80b3c2faae49f0e5864736f6c63430008130033' as `0x${string}`

describe('Contract Deployment Integration', () => {
  const ANVIL_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  
  // Chain A configuration
  const CHAIN_A_ID = 901
  const CHAIN_A_RPC_URL = 'http://127.0.0.1:9545'
  
  // Chain B configuration
  const CHAIN_B_ID = 902
  const CHAIN_B_RPC_URL = 'http://127.0.0.1:9546'
  
  const rpc = new StandardSuperRPC({
    [CHAIN_A_ID]: CHAIN_A_RPC_URL,
    [CHAIN_B_ID]: CHAIN_B_RPC_URL
  })

  type ChainState = {
    isRunning: boolean
    hasBalance: boolean
    publicClient: ReturnType<typeof createPublicClient>
    walletClient: ReturnType<typeof createWalletClient>
  }

  const chainStates: Record<number, ChainState> = {}
  let account: Account

  const createChainConfig = (chainId: number, rpcUrl: string): Chain => ({
    id: chainId,
    name: `Chain ${chainId}`,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: [rpcUrl] },
      public: { http: [rpcUrl] },
    },
  })

  // Check if chains are running and accounts have balance
  beforeAll(async () => {
    const wallet = new SuperWallet(ANVIL_PRIVATE_KEY)
    account = wallet.getAccount()

    // Initialize Chain A
    try {
      const chainAConfig = createChainConfig(CHAIN_A_ID, CHAIN_A_RPC_URL)
      const publicClient = createPublicClient({
        chain: chainAConfig,
        transport: http(CHAIN_A_RPC_URL)
      })

      const balance = await publicClient.getBalance({ address: account.address })
      
      chainStates[CHAIN_A_ID] = {
        isRunning: true,
        hasBalance: balance >= parseEther('1'),
        publicClient,
        walletClient: createWalletClient({
          chain: chainAConfig,
          transport: http(CHAIN_A_RPC_URL),
          account
        })
      }
    } catch (error) {
      console.log('Chain A not running or other setup issue:', error)
      chainStates[CHAIN_A_ID] = {
        isRunning: false,
        hasBalance: false,
        publicClient: null as any,
        walletClient: null as any
      }
    }

    // Initialize Chain B
    try {
      const chainBConfig = createChainConfig(CHAIN_B_ID, CHAIN_B_RPC_URL)
      const publicClient = createPublicClient({
        chain: chainBConfig,
        transport: http(CHAIN_B_RPC_URL)
      })

      const balance = await publicClient.getBalance({ address: account.address })
      
      chainStates[CHAIN_B_ID] = {
        isRunning: true,
        hasBalance: balance >= parseEther('1'),
        publicClient,
        walletClient: createWalletClient({
          chain: chainBConfig,
          transport: http(CHAIN_B_RPC_URL),
          account
        })
      }
    } catch (error) {
      console.log('Chain B not running or other setup issue:', error)
      chainStates[CHAIN_B_ID] = {
        isRunning: false,
        hasBalance: false,
        publicClient: null as any,
        walletClient: null as any
      }
    }
  })

  const testDirectDeployment = async (chainId: number) => {
    const chainState = chainStates[chainId]
    const chain = chainState.walletClient.chain
    
    // Skip if preconditions not met
    if (!chainState.isRunning) {
      console.log(`Skipping test: Chain ${chainId} not running`)
      return
    }
    if (!chainState.hasBalance) {
      console.log(`Skipping test: Test account has insufficient balance on chain ${chainId}`)
      return
    }

    // Deploy contract directly
    console.log(`Deploying contract directly on chain ${chainId}...`)
    const hash = await chainState.walletClient.deployContract({
      abi: TEST_CONTRACT_ABI,
      bytecode: TEST_CONTRACT_BYTECODE,
      account,
      args: [100n],  // Initial value of 100
      chain
    })

    const receipt = await chainState.publicClient.waitForTransactionReceipt({ hash })
    console.log(`Direct deployment receipt on chain ${chainId}:`, receipt)

    expect(receipt.status).toBe('success')
    expect(receipt.contractAddress).toBeDefined()

    if (!receipt.contractAddress) {
      throw new Error('No contract address in receipt')
    }

    // Test contract interaction
    console.log(`Testing contract interaction on chain ${chainId}...`)
    
    // Get initial value (should be 100)
    const initialValue = await chainState.publicClient.readContract({
      address: receipt.contractAddress,
      abi: TEST_CONTRACT_ABI,
      functionName: 'x',
    })

    console.log(`Initial value on chain ${chainId}:`, initialValue?.toString())
    expect(initialValue).toBe(100n)

    // Set value to 42
    console.log(`Setting value to 42 on chain ${chainId}...`)
    const setHash = await chainState.walletClient.writeContract({
      address: receipt.contractAddress,
      abi: TEST_CONTRACT_ABI,
      functionName: 'setX',
      args: [42n],
      account,
      chain
    })

    const setReceipt = await chainState.publicClient.waitForTransactionReceipt({ hash: setHash })
    console.log(`Set value receipt on chain ${chainId}:`, setReceipt)
    expect(setReceipt.status).toBe('success')

    // Get updated value (should be 42)
    const updatedValue = await chainState.publicClient.readContract({
      address: receipt.contractAddress,
      abi: TEST_CONTRACT_ABI,
      functionName: 'x',
    })

    console.log(`Updated value on chain ${chainId}:`, updatedValue?.toString())
    expect(updatedValue).toBe(42n)
    console.log(`Value successfully updated to 42 on chain ${chainId}`)
  }

  const testCreate2Deployment = async (chainId: number) => {
    const chainState = chainStates[chainId]
    
    // Skip if preconditions not met
    if (!chainState.isRunning) {
      console.log(`Skipping test: Chain ${chainId} not running`)
      return
    }
    if (!chainState.hasBalance) {
      console.log(`Skipping test: Test account has insufficient balance on chain ${chainId}`)
      return
    }

    // Create wallet instance
    const wallet = new SuperWallet(ANVIL_PRIVATE_KEY)

    // Get contract wrapper with unique salt
    const uniqueSalt = `0x${Date.now().toString(16).padStart(64, '0')}` as `0x${string}`
    const contract = new SuperContract(
      rpc,
      wallet,
      TEST_CONTRACT_ABI,
      TEST_CONTRACT_BYTECODE,
      [100n],  // Initial value of 100
      uniqueSalt
    )

    // First verify contract is not already deployed at the computed address
    const isDeployedBefore = await contract.isDeployed(chainId)
    expect(isDeployedBefore).toBe(false)
    console.log(`Verified contract is not already deployed at computed address on chain ${chainId}`)

    // Deploy using CREATE2
    console.log(`Deploying contract using CREATE2 on chain ${chainId}...`)
    const receipt = await contract.deploy(chainId)
    console.log(`CREATE2 deployment receipt on chain ${chainId}:`, receipt)

    expect(receipt.status).toBe('success')
    expect(contract.address).toBeDefined()

    // Test contract interaction using wrapper
    console.log(`Testing contract interaction on chain ${chainId}...`)
    const value = await contract.call(chainId, 'x')
    console.log(`Retrieved value on chain ${chainId}:`, value?.toString())
    expect(value).toBe(100n)
    console.log(`Contract interaction successful on chain ${chainId}`)

    // Verify the contract is at the computed address
    const isDeployedAfter = await contract.isDeployed(chainId)
    expect(isDeployedAfter).toBe(true)
    console.log(`Contract verified at computed address on chain ${chainId}`)

    return contract
  }

  it('should deploy and interact with contract directly (without CREATE2) on both chains', async () => {
    await testDirectDeployment(CHAIN_A_ID)
    await testDirectDeployment(CHAIN_B_ID)
  }, 60000)

  it('should deploy and interact with contract using CREATE2 factory on both chains', async () => {
    await testCreate2Deployment(CHAIN_A_ID)
    await testCreate2Deployment(CHAIN_B_ID)
  }, 60000)

  it('should deploy contracts with same address on both chains using CREATE2', async () => {
    const uniqueSalt = `0x${Date.now().toString(16).padStart(64, '0')}` as `0x${string}`
    const wallet = new SuperWallet(ANVIL_PRIVATE_KEY)
    
    const contract = new SuperContract(
      rpc,
      wallet,
      TEST_CONTRACT_ABI,
      TEST_CONTRACT_BYTECODE,
      [100n],
      uniqueSalt
    )

    // Deploy on Chain A
    if (chainStates[CHAIN_A_ID].isRunning && chainStates[CHAIN_A_ID].hasBalance) {
      const receiptA = await contract.deploy(CHAIN_A_ID)
      expect(receiptA.status).toBe('success')
    }

    // Deploy on Chain B
    if (chainStates[CHAIN_B_ID].isRunning && chainStates[CHAIN_B_ID].hasBalance) {
      const receiptB = await contract.deploy(CHAIN_B_ID)
      expect(receiptB.status).toBe('success')
    }

    // Verify contracts are deployed at the same address
    if (chainStates[CHAIN_A_ID].isRunning && chainStates[CHAIN_B_ID].isRunning) {
      const isDeployedA = await contract.isDeployed(CHAIN_A_ID)
      const isDeployedB = await contract.isDeployed(CHAIN_B_ID)
      
      expect(isDeployedA).toBe(true)
      expect(isDeployedB).toBe(true)

      // Verify values are the same
      const valueA = await contract.call(CHAIN_A_ID, 'x')
      const valueB = await contract.call(CHAIN_B_ID, 'x')
      
      expect(valueA).toBe(100n)
      expect(valueB).toBe(100n)
      
      console.log('Contract deployed at same address on both chains:', contract.address)
    }
  }, 60000)
}) 