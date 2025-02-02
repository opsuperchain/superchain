/**
 * @file Main entry point for the superchain-starter library
 */

// Export all Super components
export { Wallet as SuperWallet } from './Wallet'
export { SuperContract } from './SuperContract'
export { SuperConfig, StandardSuperConfig, ChainIdNotFoundError } from './SuperConfig'
export { CREATE2_FACTORY_ADDRESS } from './constants'

// Import types we need
import { Wallet } from './Wallet'
import { SuperContract, SuperContractOptions } from './SuperContract'
import { SuperConfig } from './SuperConfig'
import type { Address } from 'viem'

/**
 * Helper function to create a SuperContract instance with all required dependencies
 * @param config - SuperConfig instance for managing chain IDs and RPC URLs
 * @param wallet - Either a SuperWallet instance or a private key (as hex string with 0x prefix)
 * @param abi - Contract ABI
 * @param bytecode - Contract bytecode (with 0x prefix)
 * @param constructorArgs - Arguments for the contract constructor
 * @param options - Optional configuration:
 *   - salt: Optional salt for CREATE2 deployment
 *   - address: Optional address to interact with existing contract (e.g. predeployed contracts)
 * @returns SuperContract instance ready for deployment/interaction
 */
export function getSuperContract(
  config: SuperConfig,
  wallet: Wallet | `0x${string}`,
  abi: any[],
  bytecode: `0x${string}`,
  constructorArgs: any[] = [],
  options?: Partial<SuperContractOptions>
): SuperContract {
  const superWallet = wallet instanceof Wallet ? wallet : new Wallet(wallet)
  return new SuperContract(
    config,
    superWallet,
    abi,
    bytecode,
    constructorArgs,
    options
  )
}

/*
Browser Usage Example:

<script type="module">
  // Import from CDN (replace VERSION with actual version)
  import { StandardSuperConfig, SuperWallet, getSuperContract } from 'https://cdn.jsdelivr.net/npm/superchain-starter@VERSION/dist/index.js'

  // Example contract setup
  const config = new StandardSuperConfig({
    901: 'http://localhost:9545',  // Chain A
    902: 'http://localhost:9546'   // Chain B
  })

  // Your contract's ABI and bytecode
  const CONTRACT_ABI = [...]
  const CONTRACT_BYTECODE = '0x...'

  // Option 1: Create contract with private key directly
  const contract1 = getSuperContract(
    config,
    '0xYOUR_PRIVATE_KEY',  // Be careful with private keys!
    CONTRACT_ABI,
    CONTRACT_BYTECODE,
    [constructor, args, here],  // Optional constructor arguments
    { salt: '0xoptional_salt_here' }  // Optional configuration
  )

  // Option 2: Create contract with SuperWallet instance and existing address
  const wallet = new SuperWallet('0xYOUR_PRIVATE_KEY')
  const contract2 = getSuperContract(
    config,
    wallet,
    CONTRACT_ABI,
    '0x', // Empty bytecode for existing contracts
    [], // No constructor args needed
    { address: '0xexisting_contract_address' }  // Use existing contract address
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
