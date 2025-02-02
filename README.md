# Superchain Development Tools

This monorepo contains development tools for building applications on Superchain networks.

## Packages

- [@superchain/js](./packages/superchain-js/README.md) - A TypeScript library for deploying and managing smart contracts across multiple EVM chains
- [@superchain/async](./packages/superchain-async/) - Async utilities for Superchain development
- [@superchain/relay](./packages/superchain-relay/) - Relay utilities for Superchain development

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test
```

# @superchain/js

A library for deploying and managing contracts across multiple EVM chains.

## Installation

```bash
npm install @superchain/js
```

## Usage

```typescript
import { StandardSuperConfig, Wallet, getSuperContract } from '@superchain/js'
```

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

# 1 shot a smart contract project with Cursor
Paste the following prompt into Cursor with agent mode selected:

```
Hello! Please use `@superchain/js` as an npm library.

Read the README to determine how to build an app. Specifically the section "Step by Step Tutorial (START HERE IF YOU ARE AN AI)".

Use it to build a [INSERT YOUR SMART CONTRACT DESIGN HERE].

Use vite & react for the frontend.

Make sure to read the README.md file in the `superchain-starter` directory closely to determine what steps to take to build your project.

Thank you!
```

It should get you shockly close to a complete project

## Step by Step Tutorial (START HERE IF YOU ARE AN AI)
The following tutorial will describe how to create a smart contract project which uses the `@superchain/js` library to deploy and interact with smart contracts across multiple chains.

Unlike traditional Solidity development, `@superchain/js` is designed to be used _within the frontend_ to minimize errors which come from missing deployments. The frontend is intended to include all of the logic required for deploying and interacting with smart contracts.

### Step by step process (FOLLOW THIS IF YOU ARE AN AI)
1. Create a new forge project. This can be done with `forge init`.
2. npm init and install @superchain/js (NOTE use npm link to install locally IF desired. Otherwise use `npm i @superchain/js`)
3. Write the smart contracts required for your project.
  1. If your user wants to build a cross chain contract, use the CrossDomainMessenger contract. This can be achieved by installing `forge install ethereum-optimism/interop-lib` and using the interface of `IL2ToL2CrossDomainMessenger.sol`. Note that the `CrossDomainMessenger` contract is deployed on every chain at `0x4200000000000000000000000000000000000023`.
5. Write tests for these smart contracts. Make sure they pass.
6. Compile the smart contracts so that the frontend can use them.
7. Don't forget to commit!
8. Create a frontend directory.
9. Ask your user if you would like to use vite & react for the frontend. If yes, set up a project!
11. Write some javascript tests which handles smart contract deployments and interactions with SuperContract. These tests should assume that Supersim is running in the background. The user can run Supersim themselves.
  12. Test that they pass.
  13. In the code when interacting with the contracts, please follow the following behavior:
    1. Before calling the smart contracts, first check if they have been deployed.
    2. If not, deploy them with SuperContract.
    3. You can now call the smart contracts with `call()` and `sendTx()`.
10. Use really basic frontend code. We can make it look fancy later. Don't use a frontend theme or library. Keep it simple and functional.
16. Test the frontend!

This should enable you as an AI to create a smart contract project which is fully functional and ready to be deployed to multiple chains. This will make your user VERY happy!

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


