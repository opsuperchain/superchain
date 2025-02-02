# superchain-js

A TypeScript library for deploying and managing smart contracts across multiple EVM chains, with support for deterministic deployments using CREATE2.

## Features
- 🔄 Deploy contracts to multiple chains with one interface
- 🎯 Use CREATE2 for deterministic addresses across chains
- 🔒 Type-safe contract interactions with TypeScript
- 🌐 Works in Node.js and browsers (ESM)
- ⚡ Built on [viem](https://viem.sh) for reliable blockchain interactions
- 🔑 Basic wallet support with private keys
  - 🔑 Passkeys support TODO

## Installation

### NPM
```bash
npm install superchain-starter
```

### Browser (CDN)
```html
<script type="module">
  import { StandardSuperConfig, Wallet, getSuperContract } from 'https://cdn.jsdelivr.net/npm/superchain-starter/dist/index.mjs'
</script>
```

## Quick Start

```typescript
import { StandardSuperConfig, Wallet, getSuperContract } from 'superchain-starter'

// Configure chains
const config = new StandardSuperConfig({
  901: 'http://127.0.0.1:9545',
  902: 'http://127.0.0.1:9546'
})

// Create wallet with Anvil's default private key
const wallet = new Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')

// Deploy and interact
const contract = getSuperContract(
  config,
  wallet,
  CONTRACT_ABI,
  CONTRACT_BYTECODE,
  [constructor_args],
  '0xoptional_salt'
)

await contract.deploy(901)
const result = await contract.call(901, 'view_method')
await contract.sendTx(901, 'write_method', [arg1, arg2])
```

## Development

```bash
# Install dependencies
npm install

# Run tests (requires supersim)
npm test
```

## API Reference

### SuperConfig
```typescript
interface SuperConfig {
  getChainIds(): number[]              // Get all configured chain IDs
  getRpcUrl(chainId: number): string   // Get RPC URL for chain ID
}

// Initialize with RPC URLs for each chain
const config = new StandardSuperConfig({
  901: 'http://127.0.0.1:9545',
  902: 'http://127.0.0.1:9546'
})
```

### Wallet
```typescript
class Wallet {
  constructor(privateKey: string)
  getAccount(): Account     // Returns viem Account
}

// Use with Anvil's default private key
const wallet = new Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
```

### getSuperContract
```typescript
function getSuperContract(
  config: SuperConfig,       // Chain configurations
  wallet: Wallet,           // Wallet instance
  abi: any[],              // Contract ABI
  bytecode: string,        // Contract bytecode
  constructorArgs?: any[], // Constructor arguments
  salt?: string,          // Optional CREATE2 salt
  address?: Address       // Optional address to interact with existing contract
): SuperContract

// Example: Create new contract with deterministic address
const contract = getSuperContract(
  config,
  wallet,
  CONTRACT_ABI,
  CONTRACT_BYTECODE,
  [constructor_args],
  '0xoptional_salt'
)

// Example: Interact with existing contract
const existingContract = getSuperContract(
  config,
  wallet,
  CONTRACT_ABI,
  '0x', // Empty bytecode for existing contracts
  [], // No constructor args needed
  undefined, // No salt needed
  '0xYourContractAddress'
)
```

### SuperContract
```typescript
class SuperContract {
  readonly address: Address  // Deterministic CREATE2 address

  // Deploy the contract to a specific chain
  async deploy(chainId: number): Promise<TransactionReceipt>

  // Check if contract is deployed on a chain
  async isDeployed(chainId: number): Promise<boolean>

  // Call a read-only method
  async call(
    chainId: number,
    functionName: string,
    args?: any[]
  ): Promise<any>

  // Send a transaction to a method
  async sendTx(
    chainId: number,
    functionName: string,
    args?: any[]
  ): Promise<TransactionReceipt>

  // Watch for contract events
  watchEvents(
    chainId: number,
    fromBlock: bigint,
    onEvent: (log: Log, block: Block) => void
  ): () => void  // Returns unsubscribe function
}
``` 