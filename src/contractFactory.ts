import { Address, TransactionReceipt, Abi, keccak256, toHex, getCreate2Address, Log, Block, encodeFunctionData, encodeDeployData, createPublicClient, createWalletClient, http, PublicClient, WalletClient } from 'viem'
import { CREATE2_FACTORY_ADDRESS } from './constants'
import { Wallet } from './wallet'

// Updated ContractWrapper interface with address field
interface ContractWrapper {
  address: Address
  chainId: number
  sendTx: (
    functionName: string,
    args?: any[]
  ) => Promise<TransactionReceipt>
  call: (
    functionName: string,
    args?: any[]
  ) => Promise<any>
  deploy: () => Promise<{ contractAddress: Address; receipt: TransactionReceipt }>
  isDeployed: () => Promise<boolean>
  watchEvents: (fromBlock: bigint, onEvent: (log: Log, block: Block) => void) => () => void
}

// Default salt value
const defaultSalt = '0x' + keccak256(toHex('my_salt')).slice(2, 34).padStart(64, '0') as `0x${string}`

interface ClientWrapper {
  publicClient: PublicClient
  walletClient: WalletClient
}

const clientCache: { [key: string]: ClientWrapper } = {}

function getClient(chainId: number, rpcUrl: string, wallet: Wallet): ClientWrapper {
  const cacheKey = `${chainId}-${rpcUrl}`
  if (clientCache[cacheKey]) {
    return clientCache[cacheKey]
  }

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

  const publicClient = createPublicClient({
    chain: customChain,
    transport: http(rpcUrl)
  })

  const walletClient = createWalletClient({
    account: wallet.getAccount(),
    chain: customChain,
    transport: http(rpcUrl)
  })

  const wrapper: ClientWrapper = {
    publicClient,
    walletClient
  }

  clientCache[cacheKey] = wrapper
  return wrapper
}

// Function to compute contract address
export function computeXContractAddress(initcode: `0x${string}`, saltHex: `0x${string}` = defaultSalt): Address {
  const initCodeHash = keccak256(initcode)
  return getCreate2Address({
    from: CREATE2_FACTORY_ADDRESS,
    salt: saltHex,
    bytecodeHash: initCodeHash,
  })
}

// Generalized function to deploy a contract using the CREATE2 factory
export async function deployXContract(
  chainId: number,
  rpcUrl: string,
  wallet: Wallet,
  bytecode: `0x${string}`,
  saltHex: `0x${string}` = defaultSalt
): Promise<{ contractAddress: Address; receipt: TransactionReceipt }> {
  const { publicClient, walletClient } = getClient(chainId, rpcUrl, wallet)
  const data = `0x${saltHex.replace(/^0x/, '')}${bytecode.replace(/^0x/, '')}` as `0x${string}`

  console.debug('Deploying contract:')
  console.debug('Chain ID:', chainId)
  console.debug('To (CREATE2 Factory):', CREATE2_FACTORY_ADDRESS)
  console.debug('Salt:', saltHex)

  const hash = await walletClient.sendTransaction({
    account: wallet.getAccount(),
    chain: walletClient.chain,
    to: CREATE2_FACTORY_ADDRESS,
    data: data,
    gas: BigInt(5000000),
  })

  console.debug('Transaction sent. Hash:', hash)

  const receipt = await publicClient.waitForTransactionReceipt({ 
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

  const contractAddress = computeXContractAddress(bytecode, saltHex)
  console.debug('Computed contract address:', contractAddress)

  // Verify the contract was actually deployed
  const code = await publicClient.getBytecode({ address: contractAddress })
  if (!code || code === '0x') {
    throw new Error('Contract deployment failed - no code at target address')
  }

  return { contractAddress, receipt }
}

// Function to check if a contract is deployed at a given address
export async function isXContractDeployed(chainId: number, rpcUrl: string, wallet: Wallet, address: Address): Promise<boolean> {
  const { publicClient } = getClient(chainId, rpcUrl, wallet)
  try {
    const code = await publicClient.getCode({ address })
    // If the bytecode is not empty, the contract is deployed
    return code !== undefined && code !== '0x'
  } catch (error) {
    console.error('Error checking contract deployment:', error)
    return false
  }
}

// Separate sendTx function
export async function sendTx(
  chainId: number,
  rpcUrl: string,
  wallet: Wallet,
  contractAddress: Address,
  abi: Abi,
  functionName: string,
  args: any[] = []
): Promise<TransactionReceipt> {
  const { publicClient, walletClient } = getClient(chainId, rpcUrl, wallet)
  console.debug(`Preparing to send transaction for function ${functionName} with args:`, args)

  // 1. Encode the function data
  const data = encodeFunctionData({
    abi,
    functionName,
    args,
  })

  // 2. Get the chain
  const chain = walletClient.chain

  // 3. Get the nonce (convert to number)
  const nonceBigInt = await publicClient.getTransactionCount({
    address: wallet.getAccount().address,
    blockTag: 'pending',
  })
  const nonce = Number(nonceBigInt)

  // 4. Estimate gas limit
  const gasLimit = await publicClient.estimateGas({
    account: wallet.getAccount().address,
    to: contractAddress,
    data,
  })

  // 5. Get gas price (you can also use EIP-1559 fields)
  const gasPrice = await publicClient.getGasPrice()

  // 6. Build the transaction object with correct types
  const transaction = {
    to: contractAddress as Address,
    data: data as `0x${string}`,
    gas: gasLimit as bigint,
    gasPrice: gasPrice as bigint,
    nonce: nonce as number,
    chain,
    account: wallet.getAccount(),
  }

  // 7. Sign the transaction
  const serializedTransaction = await walletClient.signTransaction(transaction)
  console.debug(`${functionName} transaction signed. Serialized:`, serializedTransaction)

  // 8. Send the raw transaction
  const hash = await walletClient.sendRawTransaction({ serializedTransaction })
  console.debug(`${functionName} raw transaction sent. Hash:`, hash)

  // 9. Wait for the transaction receipt
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.debug(`${functionName} transaction receipt:`, receipt)

  return receipt
}

// Separate call function
export async function call(
  chainId: number,
  rpcUrl: string,
  wallet: Wallet,
  contractAddress: Address,
  abi: Abi,
  functionName: string,
  args: any[] = []
): Promise<any> {
  const { publicClient } = getClient(chainId, rpcUrl, wallet)
  console.debug(`Calling function ${functionName} with args:`, args)
  
  // Read the contract data
  const result = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName,
    args,
  })
  console.debug(`Result of ${functionName}:`, result)
  return result
}

// New function for watching events
export function watchContractEvents(
  chainId: number,
  rpcUrl: string,
  wallet: Wallet,
  contractAddress: Address,
  abi: Abi,
  fromBlock: bigint,
  onEvent: (log: Log, block: Block) => void
): () => void {
  const { publicClient } = getClient(chainId, rpcUrl, wallet)

  const unwatch = publicClient.watchContractEvent({
    address: contractAddress,
    abi,
    onLogs: async (logs: Log[]) => {
      for (const log of logs) {
        if (log.blockNumber) {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
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

// Updated getXContract function
export function getXContract(
  chainId: number,
  rpcUrl: string,
  wallet: Wallet,
  abi: Abi,
  bytecode: `0x${string}`,
  constructorArgs: any[] = [],
  salt: `0x${string}` = defaultSalt
): ContractWrapper {
  // Use encodeDeployData to combine bytecode and constructor args
  const deployData = encodeDeployData({
    abi,
    bytecode,
    args: constructorArgs
  })

  // Use the encoded deploy data to compute the contract address
  const contractAddress = computeXContractAddress(deployData, salt)

  const wrapper: ContractWrapper = {
    address: contractAddress,
    chainId,
    sendTx: (functionName: string, args: any[] = []) => sendTx(chainId, rpcUrl, wallet, contractAddress, abi, functionName, args),
    call: (functionName: string, args: any[] = []) => call(chainId, rpcUrl, wallet, contractAddress, abi, functionName, args),
    deploy: () => deployXContract(chainId, rpcUrl, wallet, deployData, salt),
    isDeployed: () => isXContractDeployed(chainId, rpcUrl, wallet, contractAddress),
    watchEvents: (fromBlock: bigint, onEvent: (log: Log, block: Block) => void) => 
      watchContractEvents(chainId, rpcUrl, wallet, contractAddress, abi, fromBlock, onEvent),
  }

  return wrapper
}
