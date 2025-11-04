import { Injectable } from '@nestjs/common';
import { Account, privateKeyToAccount } from 'viem/accounts';
import {
  Address,
  createPublicClient,
  createWalletClient,
  erc20Abi,
  http,
  PublicClient,
  Transport,
  WalletClient,
} from 'viem';
import { celo } from 'viem/chains';
import { NummoraLoan } from '../abis';
import { fromWei } from '../common/utils/fromWei.utility';
import { getReferralTag, submitReferral } from '@divvi/referral-sdk';
import { toWei } from '../common/utils/toWei.utility';
import { UserService } from '../user/user.service';

@Injectable()
export class InvestmentService {
  private contractAddress = process.env.NUMMORA_CORE_ADDRESS! as `0x${string}`;
  private client: WalletClient<Transport, typeof celo, Account>;
  private readonly account: Account;
  private publicClient: PublicClient = createPublicClient({
    chain: celo,
    transport: http(celo.rpcUrls.default.http[0]),
  }) as unknown as PublicClient;

  constructor(private readonly userService: UserService) {
    this.account = privateKeyToAccount(
      process.env.PRIVATE_KEY as `0x${string}`,
    );
    this.client = createWalletClient({
      account: this.account,
      chain: celo,
      transport: http(celo.rpcUrls.default.http[0]),
    });
  }

  async invest(
    amount: number,
    userAddress: Address,
    tokenAddress: Address,
    signature: `0x${string}`,
  ): Promise<number> {
    const findUser = (await this.publicClient.readContract({
      address: this.contractAddress,
      abi: NummoraLoan,
      functionName: 'isLender',
      args: [userAddress],
    })) as boolean;

    console.log('User find:', findUser);

    const balanceOfInToken = await this.publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [userAddress],
    });

    if (fromWei(balanceOfInToken) < amount) {
      //retornar mensaje de error de fondos insuficientes
    }

    const referralTag = getReferralTag({
      user: this.client.account.address,
      consumer: process.env.DIVVI_CONSUMER as `0x${string}`,
    });

    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      abi: NummoraLoan,
      functionName: 'depositWithSignature',
      args: [tokenAddress, toWei(amount), userAddress, signature],
      dataSuffix: `0x${referralTag}`,
    });

    await submitReferral({ txHash, chainId: celo.id });

    return await this.userService.updateIncreaseLenderCapital(
      userAddress,
      amount,
    );
  }
}
