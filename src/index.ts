/**
 * @file Main entry point for the superchain-starter library
 */

// Export all Super components
export { Wallet as SuperWallet } from './SuperWallet'
export { SuperContract } from './SuperContract'
export { SuperRPC, StandardSuperRPC, ChainIdNotFoundError } from './SuperRPC'
export { CREATE2_FACTORY_ADDRESS } from './constants'

// Import types we need
import { Wallet } from './SuperWallet'
import { SuperContract } from './SuperContract'
import { SuperRPC } from './SuperRPC'
import type { Address } from 'viem'

/**
 * Helper function to create a SuperContract instance with all required dependencies
 * @param rpc - SuperRPC instance for managing RPC URLs
 * @param wallet - Either a SuperWallet instance or a private key (as hex string with 0x prefix)
 * @param abi - Contract ABI
 * @param bytecode - Contract bytecode (with 0x prefix)
 * @param constructorArgs - Arguments for the contract constructor
 * @param salt - Optional salt for CREATE2 deployment (defaults to current timestamp)
 * @returns SuperContract instance ready for deployment/interaction
 */
export function getSuperContract(
  rpc: SuperRPC,
  wallet: Wallet | `0x${string}`,
  abi: any[],
  bytecode: `0x${string}`,
  constructorArgs: any[] = [],
  salt?: `0x${string}`
): SuperContract {
  const superWallet = wallet instanceof Wallet ? wallet : new Wallet(wallet)
  return new SuperContract(
    rpc,
    superWallet,
    abi,
    bytecode,
    constructorArgs,
    salt
  )
}

/*
Browser Usage Example:

<script type="module">
  // Import from CDN (replace VERSION with actual version)
  import { StandardSuperRPC, SuperWallet, getSuperContract } from 'https://cdn.jsdelivr.net/npm/superchain-starter@VERSION/dist/index.js'

  // Example contract setup
  const rpc = new StandardSuperRPC({
    901: 'http://127.0.0.1:9545',  // Chain A
    902: 'http://127.0.0.1:9546'   // Chain B
  })

  // Your contract's ABI and bytecode
  const CONTRACT_ABI = [...]
  const CONTRACT_BYTECODE = '0x...'

  // Option 1: Create contract with private key directly
  const contract1 = getSuperContract(
    rpc,
    '0xYOUR_PRIVATE_KEY',  // Be careful with private keys!
    CONTRACT_ABI,
    CONTRACT_BYTECODE,
    [constructor, args, here],  // Optional constructor arguments
    '0xoptional_salt_here'      // Optional salt for CREATE2
  )

  // Option 2: Create contract with SuperWallet instance
  const wallet = new SuperWallet('0xYOUR_PRIVATE_KEY')
  const contract2 = getSuperContract(
    rpc,
    wallet,
    CONTRACT_ABI,
    CONTRACT_BYTECODE,
    [constructor, args, here]
  )

  // Deploy to Chain A
  const receipt = await contract2.deploy(901)
  console.log('Deployed to:', contract2.address)

  // Call contract methods
  const result = await contract2.call(901, 'methodName', [arg1, arg2])
  
  // Send transactions
  const txReceipt = await contract2.send(901, 'methodName', [arg1, arg2])
</script>
*/
