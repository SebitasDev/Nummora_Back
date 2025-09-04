import { Injectable } from '@nestjs/common';
import { createWalletClient, createPublicClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { celoAlfajores } from 'viem/chains';

@Injectable()
export class WalletService {
    private account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
    private walletClient = createWalletClient({
        account: this.account,
        chain: celoAlfajores,
        transport: http(celoAlfajores.rpcUrls.default.http[0]),
    });
    private publicClient = createPublicClient({
        chain: celoAlfajores,
        transport: http(celoAlfajores.rpcUrls.default.http[0]),
    });

    getAddress() {
        return this.account.address;
    }

    async getBalance() {
        const balance = await this.publicClient.getBalance({
            address: this.account.address,
        });
        return balance.toString();
    }

    async sendTransaction(to: `0x${string}`, amount: string) {
        const hash = await this.walletClient.sendTransaction({
            account: this.account,
            to,
            value: parseEther(amount),
        });
        return hash;
    }
}
