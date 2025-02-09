import { expect, test } from 'vitest'
import { StandardSuperConfig, SuperContract, SuperWallet } from '@superchain/js'
import type { Abi } from 'viem'
import ExampleAsyncEnabled from '../../out/ExampleAsyncEnabled.sol/ExampleAsyncEnabled.json'

test('MyCoolAsync callback loop', async () => {
    console.log('Starting test...')
    
    const config = new StandardSuperConfig({
        901: 'http://localhost:9545',
        902: 'http://localhost:9546'
    })

    const returnValA = 420n
    const returnValB = 69n

    // Create wallets
    const walletA = new SuperWallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
    const walletB = new SuperWallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d')

    console.log('Deploying contract A...')
    // Deploy contracts using SuperContract
    const bytecode = ExampleAsyncEnabled.bytecode.object as `0x${string}`
    const contractA = new SuperContract(
        config,
        walletA,
        ExampleAsyncEnabled.abi as Abi,
        bytecode,
        [returnValA]
    )
    await contractA.deploy(901)
    console.log('Contract A deployed at:', contractA.address)

    console.log('Deploying contract B...')
    const contractB = new SuperContract(
        config,
        walletB,
        ExampleAsyncEnabled.abi as Abi,
        bytecode,
        [returnValB]
    )
    await contractB.deploy(902)
    console.log('Contract B deployed at:', contractB.address)

    console.log('Making async call...')
    // Make the async call
    await contractA.sendTx(901, 'makeAsyncCallAndStore', [contractB.address, 902])

    // Wait for the async call to complete, checking the value periodically
    console.log('Waiting for async call to complete...')
    let result
    for (let i = 0; i < 30; i++) {
        console.log(`Checking result attempt ${i + 1}...`)
        result = await contractA.call(901, 'lastValueReturned')
        console.log('Current value:', result)
        if (result === returnValB) {
            console.log('Success! Value matches expected')
            break
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Check the result
    console.log('Final result:', result)
    expect(result).toBe(returnValB)
}, { timeout: 45000 }) 