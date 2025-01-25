import { privateKeyToAccount } from 'viem/accounts'

// TODO: add passkey support
export class Wallet {
  private account;

  constructor(privateKey: `0x${string}`) {
    this.account = privateKeyToAccount(privateKey)
  }

  getAccount() {
    return this.account;
  }
}