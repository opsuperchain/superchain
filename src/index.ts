export interface ChainConfig {
  rpcUrl: string;
  chainId: number;
  name: string;
}

export class SuperchainConfig {
  private chains: Map<number, ChainConfig>;

  constructor() {
    this.chains = new Map();
  }

  addChain(config: ChainConfig): void {
    this.chains.set(config.chainId, config);
  }

  getChain(chainId: number): ChainConfig | undefined {
    return this.chains.get(chainId);
  }

  getAllChains(): ChainConfig[] {
    return Array.from(this.chains.values());
  }
} 