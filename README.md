# Superchain Starter

A library for deploying and managing contracts across multiple EVM chains.

## Installation

### NPM
```bash
npm install superchain-starter
```

### Browser (CDN)
```html
<script type="module">
  import { StandardSuperRPC, SuperWallet, getSuperContract } from 'https://cdn.jsdelivr.net/npm/superchain-starter/dist/index.mjs'
  
  // Your code here...
</script>
```

## Usage

### Basic Example
```javascript
import { StandardSuperRPC, SuperWallet, getSuperContract } from 'superchain-starter'

// Setup RPC endpoints
const rpc = new StandardSuperRPC({
  901: 'http://127.0.0.1:9545',  // Chain A
  902: 'http://127.0.0.1:9546'   // Chain B
})

// Create wallet
const wallet = new SuperWallet('0xYOUR_PRIVATE_KEY')

// Create contract instance
const contract = getSuperContract(
  rpc,
  wallet,
  CONTRACT_ABI,
  CONTRACT_BYTECODE,
  [/* constructor args */]
)

// Deploy to Chain A
const receipt = await contract.deploy(901)
console.log('Deployed to:', contract.address)

// Call contract methods
const result = await contract.call(901, 'methodName', [arg1, arg2])

// Send transactions
const txReceipt = await contract.send(901, 'methodName', [arg1, arg2])
```

### Advanced Features
- Deploy contracts to multiple chains
- Use CREATE2 for deterministic addresses across chains
- Manage contract interactions with type safety
- Handle cross-chain deployments efficiently

## License
MIT 