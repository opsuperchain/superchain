import { expect, test } from 'vitest'
import { StandardSuperConfig, SuperContract, SuperWallet } from '@superchain/js'
import ExampleAsyncEnabled from '../out/AsyncEnabled.sol/AsyncEnabled.json'

test.skip('MyCoolAsync callback loop', async () => {
    const config = new StandardSuperConfig({
        901: 'http://localhost:9545',
        902: 'http://localhost:9546'
    })

    const returnValA = 420n
    const returnValB = 69n

    // Create wallets
    const walletA = new SuperWallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
    const walletB = new SuperWallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d')

    // Deploy contracts using SuperContract
    const contractA = new SuperContract(
        config,
        walletA,
        ExampleAsyncEnabled.abi,
        ExampleAsyncEnabled.bytecode,
        [returnValA]
    )
    await contractA.deploy(901)

    const contractB = new SuperContract(
        config,
        walletB,
        ExampleAsyncEnabled.abi,
        ExampleAsyncEnabled.bytecode,
        [returnValB]
    )
    await contractB.deploy(902)

    // Make the async call
    await contractA.sendTx(901, 'makeAsyncCallAndStore', [contractB.address, 902])

    // Wait for the async call to complete
    await new Promise(resolve => setTimeout(resolve, 10000))

    // Check the result
    const result = await contractA.callStatic(901, 'lastValueReturned')
    expect(result).toBe(returnValB)
}) 