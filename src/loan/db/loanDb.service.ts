import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { LoanEntity } from './entities/loan.entity';
import { calculateInterest } from '../../common/utils/Interest.utility';
import { BorrowerEntity } from '../../user/entities/borrower.entity';
import { LoanStatusEnum } from './enums/loanStatus.enum';
import { LenderEntity } from 'src/user/entities/lender.entity';

@Injectable()
export class LoanDbService {
  constructor(
    @InjectRepository(LoanEntity)
    private loanRepo: Repository<LoanEntity>,
  ) {}

  async createLoan(
    borrower_id: string,
    amount: number,
    token: string,
    installments: number,
    description?: string,
    months?: number,
  ) {
    const interest = calculateInterest(installments, amount);

    const payload: DeepPartial<LoanEntity> = {
      borrower: { id: borrower_id } as BorrowerEntity,
      token: token,
      amount: amount,
      interest: interest,
      platform_fee: interest * 0.25,
      installments: installments,
      description: description,
      months: months,
      status: LoanStatusEnum.PENDING,
    };

    const loan = this.loanRepo.create(payload);
    await this.loanRepo.save(loan);
    return loan;
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

  async getLoanById(id: string) {
    return this.loanRepo.findOne({
      where: { id },
      relations: ['borrower', 'borrower.user', 'lender', 'lender.user'],
    });
  }
}
