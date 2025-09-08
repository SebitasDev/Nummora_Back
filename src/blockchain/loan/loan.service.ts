import { Injectable } from '@nestjs/common';
import { Account, privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http, Transport, WalletClient } from 'viem';
import { liskSepolia } from 'viem/chains';
import { NummoraLoan } from '../abis';
import { LoanDto } from './types/loan.dto';
import { validateHash } from '../../common/utils/hash.utility';

@Injectable()
export class LoanService {
  private account: Account;
  private client: WalletClient<Transport, typeof liskSepolia, Account>;
  private contractAddress = process.env.NUMMORA_CORE_ADDRESS! as `0x${string}`;

  constructor() {
    this.account = privateKeyToAccount(
      process.env.PRIVATE_KEY as `0x${string}`,
    );
    this.client = createWalletClient({
      account: this.account,
      chain: liskSepolia,
      transport: http(liskSepolia.rpcUrls.default.http[0]),
    });
  }

  validateLoanDataHash(payload: LoanDto): boolean {
    return validateHash(
      [
        'address',
        'address',
        'address',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
      ],
      [
        payload.lender as `0x${string}`,
        payload.borrower as `0x${string}`,
        payload.token as `0x${string}`,
        BigInt(payload.amount),
        BigInt(payload.interest),
        BigInt(payload.installments),
        BigInt(payload.platformFee),
      ],
      payload.dataHash as `0x${string}`,
    );
  }

  async createLoan(payload: LoanDto) {
    try {
      if (!this.validateLoanDataHash(payload)) {
        throw new Error(
          'El dataHash no coincide. Los datos fueron alterados ❌',
        );
      }

      const {
        lender,
        borrower,
        token,
        amount,
        interest,
        installments,
        platformFee,
      } = payload;

      return await this.client.writeContract({
        address: this.contractAddress,
        abi: NummoraLoan,
        functionName: 'createLoan',
        args: [
          lender,
          borrower,
          token,
          amount,
          interest,
          installments,
          platformFee,
        ],
      });
    } catch (e) {
      throw new Error(JSON.stringify(e, null, 2));
    }
  }
}
