import { Injectable } from '@nestjs/common';
import type { Chain, PublicClient, WalletClient, Transport } from 'viem';
import { createPublicClient, createWalletClient, http } from 'viem';
import { celo, celoSepolia } from 'viem/chains';
import { ConfigService } from '@nestjs/config';
import { privateKeyToAccount } from 'viem/accounts';

@Injectable()
export class ChainFactory {
  constructor(private readonly configService: ConfigService) {}

  private getChain(): Chain {
    const environment = this.configService.get<string>('ENVIRONMENT') || 'dev';
    return environment === 'dev' ? celoSepolia : celo;
  }

  createPublicClient(): PublicClient {
    const chain = this.getChain();
    return createPublicClient({
      chain,
      transport: http(chain.rpcUrls.default.http[0]),
    });
  }

  createWalletClient(): WalletClient<Transport, Chain> {
    const chain = this.getChain();
    const privateKey = this.configService.get<string>('gasSupplierPrivateKey');
    if (!privateKey) {
      throw new Error('Missing gasSupplierPrivateKey in environment');
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`);

    return createWalletClient({
      account,
      chain,
      transport: http(chain.rpcUrls.default.http[0]),
    });
  }
}
