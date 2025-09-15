import { Injectable } from '@nestjs/common';
import { Account, privateKeyToAccount } from 'viem/accounts';
import {
  Address,
  createWalletClient,
  http,
  Transport,
  WalletClient,
} from 'viem';
import { liskSepolia } from 'viem/chains';
import { validateHash } from '../../common/utils/hash.utility';
import { NummoraLoan } from '../../abis';
import { CreateLoanDto } from '../db/types/createLoanDto';
import { UserService } from '../../user/user.service';
import { GenerateLoanDto } from '../db/types/generateLoan.dto';
import { LoanDbService } from '../db/loanDb.service';
import { toWei } from '../../common/utils/toWei.utility';
import { calculateInterest } from '../../common/utils/Interest.utility';

@Injectable()
export class LoanBlockchainService {
  private readonly account: Account;
  private client: WalletClient<Transport, typeof liskSepolia, Account>;
  private contractAddress = process.env.NUMMORA_CORE_ADDRESS! as `0x${string}`;

  constructor(
    private readonly userService: UserService,
    private readonly loanDbService: LoanDbService,
  ) {
    this.account = privateKeyToAccount(
      process.env.PRIVATE_KEY as `0x${string}`,
    );
    this.client = createWalletClient({
      account: this.account,
      chain: liskSepolia,
      transport: http(liskSepolia.rpcUrls.default.http[0]),
    });
  }

  validateLoanDataHash(payload: CreateLoanDto): boolean {
    return validateHash(
      ['string', 'address'],
      [payload.loanId, payload.lenderAddress as `0x${string}`],
      payload.dataHash as `0x${string}`,
    );
  }

  async financeLoan(payload: CreateLoanDto) {
    try {
      const { loanId, lenderAddress } = payload;

      const loan = await this.loanDbService.getLoanById(loanId);

      if (!loan) {
        throw new Error('El préstamo no existe ❌');
      }

      if (!this.validateLoanDataHash(payload)) {
        throw new Error(
          'El dataHash no coincide. Los datos fueron alterados ❌',
        );
      }

      const userLender = await this.userService.findByAddress(
        payload.lenderAddress,
        'lender',
      );

      if (userLender!.lender!.available_capital < loan.amount) {
        throw new Error(
          'El prestamista no tiene capital disponible suficiente ❌',
        );
      }

      const interest = calculateInterest(loan.installments, loan.amount);

      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        abi: NummoraLoan,
        functionName: 'createLoan',
        args: [
          lenderAddress, //Address del lender
          loan.borrower.user.account_address, //Address del borrower
          loan.token, //Address del token
          toWei(loan.amount), //Monto prestado
          toWei(interest), //Interés total a pagar
          BigInt(loan.installments), //Número de cuotas
          toWei(interest * (25 / 100)), //Interes que se queda la plataforma
        ],
      });

      await this.loanDbService.updateLoanLender(
        loan.id,
        userLender!.lender!.id,
      );
      await this.userService.updateLenderCapital(lenderAddress, loan.amount);
      return txHash;
    } catch (e) {
      throw new Error(JSON.stringify(e, null, 2));
    }
  }

  async generateLoan(
    payload: GenerateLoanDto,
  ): Promise<{ message: string; txHash: Address | null }> {
    try {
      const borrower = await this.userService.findBorrowerById(
        payload.borrowerId,
      );

      if (!borrower) {
        throw new Error('El borrower no existe ❌');
      }

      const loan = await this.loanDbService.createLoan(
        payload.borrowerId,
        payload.amount,
        payload.token,
        payload.installments,
        payload.description,
        payload.months,
      );

      const lender = await this.userService.findLenderByAvailableCapital(
        payload.amount,
      );

      if (!lender) {
        return {
          message:
            'No hay prestamistas con capital disponible en este momento. ' +
            'Se ha creado un préstamo temporal en la base de datos. ' +
            'Tan pronto como un prestamista tenga capital disponible, ' +
            'se procederá a crear el préstamo en la blockchain.',
          txHash: null,
        };
      }

      await this.loanDbService.updateLoanLender(loan.id, lender.id);

      const interest = calculateInterest(loan.installments, loan.amount);

      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        abi: NummoraLoan,
        functionName: 'createLoan',
        args: [
          lender.user.account_address, //Address del lender
          borrower.user.account_address, //Address del borrower
          loan.token, //Address del token
          toWei(loan.amount), //Monto prestado
          toWei(interest), //Interés total a pagar
          BigInt(loan.installments), //Número de cuotas
          toWei(interest * (25 / 100)), //Interes que se queda la plataforma
        ],
      });

      await this.userService.updateLenderCapital(
        lender.user.account_address,
        loan.amount,
      );

      return {
        message: 'Préstamo creado exitosamente en la blockchain ✅',
        txHash: txHash,
      };
    } catch (e) {
      throw new Error(JSON.stringify(e, null, 2));
    }
  }
}
