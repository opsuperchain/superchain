# superchain-starter

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
  import { StandardSuperConfig, SuperWallet, getSuperContract } from 'https://cdn.jsdelivr.net/npm/superchain-starter/dist/index.mjs'
</script>
```

## Quick Start

```typescript
import { StandardSuperConfig, SuperWallet, getSuperContract } from 'superchain-starter'

// Configure chains
const config = new StandardSuperConfig({
  901: 'http://127.0.0.1:9545',
  902: 'http://127.0.0.1:9546'
})

// Create wallet with Anvil's default private key
const wallet = new SuperWallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')

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
await contract.send(901, 'write_method', [arg1, arg2])
```

## Development

```bash
# Install dependencies
npm install

# Run tests (requires supersim)
npm test
```

# 1 shot a smart contract project with Cursor
[TODO] Tutorial coming soon.

# Documentation

## Getting Started Tutorial with a Frontend Driven Smart Contract Dev Workflow
Instead of deploying the smart contracts on the backend, we want to deploy them in the frontend so that if the frontend is connected to a chain which does not have access to the contracts, it can still deploy them.

### Project Setup
1. Create a Forge project for Solidity contracts
2. Run Supersim in the background:
```bash
npm i -g supersim
npx supersim --interop.autorelay
```

### Contract Creation
1. Write and compile contracts with Forge
2. Get ABI and bytecode from compilation artifacts
3. Use `getSuperContract` in the frontend with:
   - Anvil's default private key
   - Compiled ABI and bytecode
   - Constructor arguments
4. Do not deploy the smart contracts on the backend

### Frontend Integration
1. Create a SuperContract instance in the frontend
2. Check contract deployment status
3. Auto-deploy if needed
4. Call contract methods with `call()` and `send()`

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
  salt?: string           // Optional CREATE2 salt
): SuperContract
```


