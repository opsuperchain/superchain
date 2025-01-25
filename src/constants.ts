import { Abi } from 'viem'

// Use the injected constants instead of process.env
export const CHAIN_IDS: number[] = __CHAIN_IDS__
export const RPC_URLS: { [chainId: number]: string } = __RPC_URLS__
export const DEFAULT_PRIVATE_KEY: `0x${string}` = __DEFAULT_PRIVATE_KEY__
export const CREATE2_FACTORY_ADDRESS = '0x4e59b44847b379578588920cA78FbF26c0B4956C'