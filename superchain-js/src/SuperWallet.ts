import { privateKeyToAccount, Account, Address  } from 'viem/accounts'

// TODO: add passkey support
export class SuperWallet {
  private account;

  constructor(privateKey: `0x${string}`) {
    this.account = privateKeyToAccount(privateKey)
  }

  getAccount(): Account {
    return this.account;
  }

  getAddress(): Address {
    return this.account.address;
  }
}
