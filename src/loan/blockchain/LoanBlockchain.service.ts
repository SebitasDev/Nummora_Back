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
import { liskSepolia } from 'viem/chains';
import { validateHash } from '../../common/utils/hash.utility';
import { NummoraLoan } from '../../abis';
import { CreateLoanDto } from '../db/types/createLoanDto';
import { UserService } from '../../user/user.service';
import { GenerateLoanDto } from '../db/types/generateLoan.dto';
import { LoanDbService } from '../db/loanDb.service';
import { toWei } from '../../common/utils/toWei.utility';
import { calculateInterest } from '../../common/utils/Interest.utility';
import { decodeTransactionEvent } from '../../common/helpers/decodeTransactionEvent.helper';
import { LoanStatusEnum } from '../db/enums/loanStatus.enum';
import { PayInstallmentDto } from '../db/types/payInstallmentDto';

@Injectable()
export class LoanBlockchainService {
  private readonly account: Account;
  private client: WalletClient<Transport, typeof liskSepolia, Account>;
  private contractAddress = process.env.NUMMORA_CORE_ADDRESS! as `0x${string}`;
  private publicClient: PublicClient = createPublicClient({
    chain: liskSepolia,
    transport: http(liskSepolia.rpcUrls.default.http[0]),
  }) as unknown as PublicClient;

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

      const loan = await this.loanDbService.getLoanById(loanId, [
        'borrower',
        'borrower.user',
        'lender',
        'lender.user',
      ]);

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
        ['lender'],
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

      const lender = await this.userService.findLenderByAvailableCapital(
        payload.amount,
      );

      if (!lender) {
        await this.loanDbService.createLoan(
          payload.borrowerId,
          payload.amount,
          payload.token,
          payload.installments,
          LoanStatusEnum.PENDING,
          payload.description,
          payload.months,
        );

        return {
          message:
            'No hay prestamistas con capital disponible en este momento. ' +
            'Se ha creado un préstamo temporal en la base de datos. ' +
            'Tan pronto como un prestamista tenga capital disponible, ' +
            'se procederá a crear el préstamo en la blockchain.',
          txHash: null,
        };
      }

      const interest = calculateInterest(payload.installments, payload.amount);

      const txHash: Address = await this.client.writeContract({
        address: this.contractAddress,
        abi: NummoraLoan,
        functionName: 'createLoan',
        args: [
          lender.user.account_address, //Address del lender
          borrower.user.account_address, //Address del borrower
          payload.token, //Address del token
          toWei(payload.amount), //Monto prestado
          toWei(interest), //Interés total a pagar
          BigInt(payload.installments), //Número de cuotas
          toWei(interest * 0.25), //Interes que se queda la plataforma
        ],
      });

      const loanCreateEvent = await decodeTransactionEvent<'LoanCreated'>(
        this.publicClient,
        txHash,
        'event LoanCreated(uint256 loanId, address lender, address borrower, uint256 amount)',
      );

      const loan = await this.loanDbService.createLoan(
        payload.borrowerId,
        payload.amount,
        payload.token,
        payload.installments,
        LoanStatusEnum.ACTIVE,
        payload.description,
        payload.months,
        lender.id,
        Number(loanCreateEvent[0].args.loanId as bigint),
        txHash,
      );

      await this.userService.updateLenderCapital(
        lender.user.account_address,
        loan.amount,
      );

      return {
        message: 'Préstamo creado exitosamente en la blockchain ✅',
        txHash: txHash,
      };
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(e?.message ?? 'Error desconocido');
    }
  }

  async payInstallment(payload: PayInstallmentDto) {
    try {
      const loan = await this.loanDbService.getLoanById(payload.loanId, [
        'installments_list',
      ]);

      if (!loan) throw new Error('El préstamo no existe ❌');

      if (
        loan.status.toString() !==
          LoanStatusEnum[LoanStatusEnum.ACTIVE].toString() ||
        !loan.loanIdBlockchain
      )
        throw new Error('El préstamo no está activo ❌');

      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        abi: NummoraLoan,
        functionName: 'payInstallmentWithSignature',
        args: [
          BigInt(loan.loanIdBlockchain), //LoanId
          payload.signature, //Firma del borrower
        ],
      });

      const paymentEvent = await decodeTransactionEvent<'PaymentMade'>(
        this.publicClient,
        txHash,
        'event PaymentMade(uint256 loanId, uint256 amount)',
      );

      if (
        !paymentEvent.length ||
        paymentEvent[0].args.loanId !== BigInt(loan.loanIdBlockchain)
      )
        throw new Error('No se pudo verificar el pago en la blockchain ❌');

      const installmentIdToPay = loan.installments_list
        .filter((installment) => !installment.paid) // solo cuotas pendientes
        .sort(
          (i1, i2) =>
            new Date(i1.due_date).getTime() - new Date(i2.due_date).getTime(),
        )[0].id;

      await this.loanDbService.markInstallmentAsPaid(installmentIdToPay);

      return txHash;
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(e?.message ?? 'Error desconocido');
    }
  }
}
