import { Injectable } from '@nestjs/common';
import { Account, privateKeyToAccount } from 'viem/accounts';
import {
  Address,
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
  Transport,
  WalletClient,
} from 'viem';
import { celo } from 'viem/chains';
import { UserService } from '../user.service';
import { NummoraLoan } from '../../abis';
import { decodeTransactionEvent } from '../../common/helpers/decodeTransactionEvent.helper';
import { getReferralTag, submitReferral } from '@divvi/referral-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserBlockchainService {
  private readonly account: Account;
  private client: WalletClient<Transport, typeof celo, Account>;
  private publicClient: PublicClient = createPublicClient({
    chain: celo,
    transport: http(celo.rpcUrls.default.http[0]),
  }) as unknown as PublicClient;
  private readonly NUMMORA_CORE_ADDRESS: Address;
  private readonly DIVVI_CONSUMER: Address;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    const GAS_SUPPLIER_PRIVATE_KEY = this.configService.get<string>(
      'gasSupplierPrivateKey',
    )!;

    this.account = privateKeyToAccount(
      GAS_SUPPLIER_PRIVATE_KEY as `0x${string}`,
    );

    this.NUMMORA_CORE_ADDRESS = this.configService.get<Address>(
      'nummoraCoreAddress',
    ) as Address;

    this.NUMMORA_CORE_ADDRESS = this.configService.get<Address>(
      'divviConsumer',
    ) as Address;

    this.client = createWalletClient({
      account: this.account,
      chain: celo,
      transport: http(celo.rpcUrls.default.http[0]),
    });
  }

  async registerLender(address: Address, signature: `0x${string}`) {
    try {
      const findLenderBlockchain = (await this.publicClient.readContract({
        address: this.NUMMORA_CORE_ADDRESS,
        abi: NummoraLoan,
        functionName: 'isLender',
        args: [address],
      })) as boolean;

      if (findLenderBlockchain) {
        throw new Error('User already registered as lender');
      }

      const referralTag = getReferralTag({
        user: this.client.account.address,
        consumer: this.DIVVI_CONSUMER,
      });

      const txHash = await this.client.writeContract({
        address: this.NUMMORA_CORE_ADDRESS,
        abi: NummoraLoan,
        functionName: 'registerLenderWithSignature',
        args: [signature],
        dataSuffix: `0x${referralTag}`,
      });

      await submitReferral({ txHash, chainId: celo.id });

      const lenderRegisterEvent =
        await decodeTransactionEvent<'LenderRegistered'>(
          this.publicClient,
          txHash,
          'event LenderRegistered(address lender)',
        );

      if (!lenderRegisterEvent.length) {
        throw new Error('Lender not registered on blockchain');
      }

      await this.userService.createLender(
        lenderRegisterEvent[0].args.lender as Address,
      );

      console.log(lenderRegisterEvent[0].args.lender as Address);

      return { txHash: txHash, message: 'Usuario registrado como lender ✅' };
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(e?.message ?? 'Error desconocido');
    }
  }

  async registerBorrower(address: Address, signature: `0x${string}`) {
    try {
      const findBorrowerBlockchain = (await this.publicClient.readContract({
        address: this.NUMMORA_CORE_ADDRESS,
        abi: NummoraLoan,
        functionName: 'isBorrower',
        args: [address],
      })) as boolean;

      if (findBorrowerBlockchain) {
        throw new Error('User already registered as borrower');
      }

      const referralTag = getReferralTag({
        user: this.client.account.address,
        consumer: this.DIVVI_CONSUMER,
      });

      const txHash = await this.client.writeContract({
        address: this.NUMMORA_CORE_ADDRESS,
        abi: NummoraLoan,
        functionName: 'registerBorrowerWithSignature',
        args: [signature],
        dataSuffix: `0x${referralTag}`,
      });

      await submitReferral({ txHash, chainId: celo.id });

      const BorrowerRegisterEvent =
        await decodeTransactionEvent<'BorrowerRegistered'>(
          this.publicClient,
          txHash,
          'event BorrowerRegistered(address borrower)',
        );

      if (!BorrowerRegisterEvent.length) {
        throw new Error('borrower not registered on blockchain');
      }

      await this.userService.createBorrower(
        BorrowerRegisterEvent[0].args.borrower as Address,
      );

      return { txHash: txHash, message: 'Usuario registrado como borrower ✅' };
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(e?.message ?? 'Error desconocido');
    }
  }
}
