import { Address, TransactionReceipt, Abi, keccak256, toHex, getCreate2Address, Log, Block, encodeFunctionData, encodeDeployData, createPublicClient, createWalletClient, http, PublicClient, WalletClient } from 'viem'
import { CREATE2_FACTORY_ADDRESS } from './constants'
import { Wallet } from './wallet'

// Default salt value
const defaultSalt = '0x' + keccak256(toHex('my_salt')).slice(2, 34).padStart(64, '0') as `0x${string}`

export class XContract {
  private publicClient: PublicClient
  private walletClient: WalletClient
  public readonly address: Address
  public readonly chainId: number

  constructor(
    chainId: number,
    rpcUrl: string,
    private wallet: Wallet,
    private abi: Abi,
    private bytecode: `0x${string}`,
    private constructorArgs: any[] = [],
    private salt: `0x${string}` = defaultSalt
  ) {
    this.chainId = chainId
    
    const customChain = {
      id: chainId,
      name: `Chain ${chainId}`,
      network: `network-${chainId}`,
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: { http: [rpcUrl] },
        public: { http: [rpcUrl] },
      },
    }

    this.publicClient = createPublicClient({
      chain: customChain,
      transport: http(rpcUrl)
    })

    this.walletClient = createWalletClient({
      account: wallet.getAccount(),
      chain: customChain,
      transport: http(rpcUrl)
    })

    // Compute the deterministic address
    const deployData = encodeDeployData({
      abi,
      bytecode,
      args: constructorArgs
    })
    this.address = this.computeAddress(deployData)
  }

  private computeAddress(initcode: `0x${string}`): Address {
    const initCodeHash = keccak256(initcode)
    return getCreate2Address({
      from: CREATE2_FACTORY_ADDRESS,
      salt: this.salt,
      bytecodeHash: initCodeHash,
    })
  }

  async deploy(): Promise<TransactionReceipt> {
    const deployData = encodeDeployData({
      abi: this.abi,
      bytecode: this.bytecode,
      args: this.constructorArgs
    })

    const data = `0x${this.salt.replace(/^0x/, '')}${deployData.replace(/^0x/, '')}` as `0x${string}`

    console.debug('Deploying contract:')
    console.debug('Chain ID:', this.chainId)
    console.debug('To (CREATE2 Factory):', CREATE2_FACTORY_ADDRESS)
    console.debug('Salt:', this.salt)

    const hash = await this.walletClient.sendTransaction({
      account: this.wallet.getAccount(),
      chain: this.walletClient.chain,
      to: CREATE2_FACTORY_ADDRESS,
      data: data,
      gas: BigInt(5000000),
    })

    console.debug('Transaction sent. Hash:', hash)

    const receipt = await this.publicClient.waitForTransactionReceipt({ 
      hash,
      pollingInterval: 100,
      retryDelay: 100,
      retryCount: 100,
    })

    console.debug('Contract deployment receipt:', {
      transactionHash: receipt.transactionHash,
      contractAddress: receipt.contractAddress,
      gasUsed: receipt.gasUsed,
      status: receipt.status
    })

    if (receipt.status === 'reverted') {
      throw new Error('Contract deployment failed - transaction reverted')
    }

    // Verify the contract was actually deployed
    const code = await this.publicClient.getBytecode({ address: this.address })
    if (!code || code === '0x') {
      throw new Error('Contract deployment failed - no code at target address')
    }

    return receipt
  }

  async isDeployed(): Promise<boolean> {
    try {
      const code = await this.publicClient.getCode({ address: this.address })
      return code !== undefined && code !== '0x'
    } catch (error) {
      console.error('Error checking contract deployment:', error)
      return false
    }
  }

  async sendTx(functionName: string, args: any[] = []): Promise<TransactionReceipt> {
    console.debug(`Preparing to send transaction for function ${functionName} with args:`, args)

    const data = encodeFunctionData({
      abi: this.abi,
      functionName,
      args,
    })

    const chain = this.walletClient.chain
    const nonceBigInt = await this.publicClient.getTransactionCount({
      address: this.wallet.getAccount().address,
      blockTag: 'pending',
    })
    const nonce = Number(nonceBigInt)
    const gasLimit = await this.publicClient.estimateGas({
      account: this.wallet.getAccount().address,
      to: this.address,
      data,
    })
    const gasPrice = await this.publicClient.getGasPrice()

    const transaction = {
      to: this.address,
      data: data as `0x${string}`,
      gas: gasLimit as bigint,
      gasPrice: gasPrice as bigint,
      nonce: nonce as number,
      chain,
      account: this.wallet.getAccount(),
    }

    const serializedTransaction = await this.walletClient.signTransaction(transaction)
    console.debug(`${functionName} transaction signed. Serialized:`, serializedTransaction)

    const hash = await this.walletClient.sendRawTransaction({ serializedTransaction })
    console.debug(`${functionName} raw transaction sent. Hash:`, hash)

    const receipt = await this.publicClient.waitForTransactionReceipt({ hash })
    console.debug(`${functionName} transaction receipt:`, receipt)

    return receipt
  }

  async call(functionName: string, args: any[] = []): Promise<any> {
    console.debug(`Calling function ${functionName} with args:`, args)
    
    const result = await this.publicClient.readContract({
      address: this.address,
      abi: this.abi,
      functionName,
      args,
    })
    console.debug(`Result of ${functionName}:`, result)
    return result
  }

  watchEvents(fromBlock: bigint, onEvent: (log: Log, block: Block) => void): () => void {
    const unwatch = this.publicClient.watchContractEvent({
      address: this.address,
      abi: this.abi,
      onLogs: async (logs: Log[]) => {
        for (const log of logs) {
          if (log.blockNumber) {
            const block = await this.publicClient.getBlock({ blockNumber: log.blockNumber })
            onEvent(log, block)
          } else {
            console.warn('Event received without block number:', log)
          }
        }
      },
      fromBlock,
    })

    return unwatch
  }
}
