import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { LoanEntity } from './entities/loan.entity';
import { calculateInterest } from '../../common/utils/Interest.utility';
import { BorrowerEntity } from '../../user/entities/borrower.entity';
import { LoanStatusEnum } from './enums/loanStatus.enum';
import { LenderEntity } from 'src/user/entities/lender.entity';
import { InstallmentEntity } from './entities/installment.entity';
import { addDays } from 'date-fns';
import { Address } from 'viem';

@Injectable()
export class LoanDbService {
  constructor(
    @InjectRepository(LoanEntity)
    private loanRepo: Repository<LoanEntity>,
    @InjectRepository(InstallmentEntity)
    private installmentRepo: Repository<InstallmentEntity>,
    private dataSource: DataSource,
  ) {}

  async createLoan(
    borrower_id: string,
    amount: number,
    token: string,
    installments: number,
    status: LoanStatusEnum,
    description?: string,
    months?: number,
    lender_id?: string,
    loanIdBlockchain?: number,
    tx_hash?: Address,
  ) {
    const interest = calculateInterest(installments, amount);

    const payload: DeepPartial<LoanEntity> = {
      loanIdBlockchain: loanIdBlockchain,
      borrower: { id: borrower_id } as BorrowerEntity,
      token: token,
      amount: amount,
      interest: interest,
      platform_fee: interest * 0.25,
      installments: installments,
      description: description,
      months: months,
      status: status,
      installments_list: [],
      lender_id: lender_id,
      tx_hash: tx_hash?.toString(),
    };

    console.log('Creating loan with payload:', payload);

    return await this.dataSource.transaction(async (manager) => {
      const loan = manager.create(LoanEntity, payload);

      await manager.save(loan);

      const installmentAmount = (amount + interest) / loan.installments;
      const intervalDays = Math.floor(
        (months == null ? 1 : months * 30) / loan.installments,
      );
      const now: Date = new Date();

      const installments = Array.from({ length: loan.installments }, (_, i) => {
        const dueDate = addDays(now, (i + 1) * intervalDays);

        return manager.create(InstallmentEntity, {
          loan,
          amount: installmentAmount,
          due_date: dueDate,
          paid: false,
          installment_number: i + 1,
        });
      });

      await manager.save(installments);

      loan.installments_list = installments;

      return loan;
    });
  }

  async updateLoanLender(loanId: string, lenderId: string) {
    return await this.loanRepo.update(
      { id: loanId },
      {
        lender: { id: lenderId } as LenderEntity,
        status: LoanStatusEnum.ACTIVE,
      },
    );
  }

  async getAllLoansByStatus(status: LoanStatusEnum) {
    return this.loanRepo.findBy({ status: status });
  }

  async getLoanById(id: string, relations: string[] = []) {
    return this.loanRepo.findOne({
      where: { id },
      relations,
    });
  }

  async markInstallmentAsPaid(installmentId: string): Promise<void> {
    const installment = await this.installmentRepo.findOneBy({
      id: installmentId,
    });

    if (!installment) throw new Error('La cuota no existe ❌');

    installment.paid = true;
    installment.paid_at = new Date();
    await this.installmentRepo.save(installment);

    const loan = await this.loanRepo.findOne({
      where: { id: installment.loan_id },
      relations: ['installments_list'],
    });

    const allPaid = loan!.installments_list.every((i) => i.paid);

    if (allPaid) {
      loan!.status = LoanStatusEnum.COMPLETED;
      await this.loanRepo.save(loan!);
    }
  }
}
