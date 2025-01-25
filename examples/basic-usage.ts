import { SuperchainConfig, ChainConfig } from '../src';

// Create a new SuperchainConfig instance
const config = new SuperchainConfig();

// Add some example chains
const optimism: ChainConfig = {
  rpcUrl: 'https://mainnet.optimism.io',
  chainId: 10,
  name: 'Optimism'
};

const base: ChainConfig = {
  rpcUrl: 'https://mainnet.base.org',
  chainId: 8453,
  name: 'Base'
};

// Add chains to the config
config.addChain(optimism);
config.addChain(base);

// Get a specific chain
const optimismConfig = config.getChain(10);
console.log('Optimism config:', optimismConfig);

// Get all chains
const allChains = config.getAllChains();
console.log('All chains:', allChains); 