# superchain-starter

A TypeScript library for deploying and managing smart contracts across multiple EVM chains, with support for deterministic deployments using CREATE2.

## Features
- 🔄 Deploy contracts to multiple chains with one interface
- 🎯 Use CREATE2 for deterministic addresses across chains
- [TODO] 🔒 Type-safe contract interactions (we don't have this...)
- 🌐 Works in Node.js and browsers (ESM)
- ⚡ Built on [viem](https://viem.sh) for reliable blockchain interactions
- [TODO] Wallet integration with passkeys. Right now this is really only for testing with private keys baked into the frontend

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

## Development

```bash
# Install dependencies
npm install

# Run tests (requires supersim)
npm test
```

# 1 shot a smart contract project with Cursor
[leave this blank with a TODO. This is a placeholder for the tutorial]

# Documentation

## Getting Started Tutorial
Should include:
* Tips on project structure and how to use the library
  * A basic forge project used for compiling the solidity contracts
  * Supersim running in the background
    ```
    npm i -g supersim
    npx supersim --interop.autorelay
    ```
  * Call getSuperContract(..) with all of the required parameters
    * The wallet should just use a defualt private key for anvil
    * The bytecode and abi should be compiled from the forge project
    * The constructor args should be the arguments for the constructor
  * If there are issues with deployment, try using forge cast to deploy the contract manually. Verify the bytecode is right
  * For the frontend, you should first check that the contract is deployed. If it's not deployed auto deploy it in the background (or you can have a button deploy if you want)
  * Then just go ham!

[todo]

## API Reference
Focus on getSuperContract -- that's what we really need to explain.

[todo]


