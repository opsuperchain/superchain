export class ChainIdNotFoundError extends Error {
  constructor(public readonly chainId: number) {
    super(`No RPC URL configured for chain ID ${chainId}`)
    this.name = 'ChainIdNotFoundError'
  }
}

export interface SuperRPC {
  /**
   * Get the RPC URL for a given chain ID
   * @param chainId The chain ID to get the RPC URL for
   * @throws {ChainIdNotFoundError} If no RPC URL is configured for the given chain ID
   * @returns The RPC URL for the chain
   */
  getUrl(chainId: number): string
}

export class StandardSuperRPC implements SuperRPC {
  constructor(private rpcMap: Record<number, string>) {}

  getUrl(chainId: number): string {
    const url = this.rpcMap[chainId]
    if (!url) {
      throw new ChainIdNotFoundError(chainId)
    }
    return url
  }
} 