# superchain-starter

A TypeScript library for deploying and managing smart contracts across multiple EVM chains, with support for deterministic deployments using CREATE2.

## Features
- 🔄 Deploy contracts to multiple chains with one interface
- 🎯 Use CREATE2 for deterministic addresses across chains
- 🔒 Type-safe contract interactions
- 🌐 Works in Node.js and browsers (ESM)
- ⚡ Built on [viem](https://viem.sh) for reliable blockchain interactions

## Installation

### NPM
```bash
npm install superchain-starter
```

### Browser (CDN)
```html
<script type="module">
  import { StandardSuperRPC, SuperWallet, getSuperContract } from 'https://cdn.jsdelivr.net/npm/superchain-starter/dist/index.mjs'
</script>
```

## Quick Start

```typescript
import { StandardSuperRPC, SuperWallet, getSuperContract } from 'superchain-starter'

// 1. Setup RPC endpoints
const rpc = new StandardSuperRPC({
  901: 'http://127.0.0.1:9545',  // Chain A
  902: 'http://127.0.0.1:9546'   // Chain B
})

// 2. Create wallet
const wallet = new SuperWallet('0xYOUR_PRIVATE_KEY')

// 3. Create contract instance
const contract = getSuperContract(
  rpc,
  wallet,
  CONTRACT_ABI,
  CONTRACT_BYTECODE,
  [/* constructor args */]
)

// 4. Deploy to Chain A
const receipt = await contract.deploy(901)
console.log('Deployed to:', contract.address)

// 5. Call contract methods
const result = await contract.call(901, 'methodName', [arg1, arg2])

// 6. Send transactions
const txReceipt = await contract.send(901, 'methodName', [arg1, arg2])
```

## Deterministic Deployments

Deploy contracts to the same address on multiple chains:

```typescript
// Create contract with specific salt for deterministic address
const contract = getSuperContract(
  rpc,
  wallet,
  CONTRACT_ABI,
  CONTRACT_BYTECODE,
  [/* constructor args */],
  '0xYOUR_SALT_HERE'  // Optional: provide a salt for deterministic address
)

// Deploy to multiple chains - will have same address!
await contract.deploy(901)  // Chain A
await contract.deploy(902)  // Chain B
```

## Development

```bash
# Install dependencies
npm install

# Run tests (requires supersim)
npm test
```

## License
MIT 