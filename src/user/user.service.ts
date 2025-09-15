import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { LenderEntity } from './entities/lender.entity';
import { BorrowerEntity } from './entities/borrower.entity';
import {UserEntity} from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(LenderEntity)
    private lenderRepo: Repository<LenderEntity>,
    @InjectRepository(BorrowerEntity)
    private borrowerRepo: Repository<BorrowerEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  async findLenderByAvailableCapital(amount: number) {
    return await this.lenderRepo.findOne({
      where: {
        available_capital: MoreThanOrEqual(amount),
      },
      relations: ['user'],
    });
  }

  async findBorrowerById(id: string) {
    return await this.borrowerRepo.findOne({
      where: {
        id: id,
      },
      relations: ['user'],
    });
  }

  async findByAddress(address: string, role: 'lender' | 'borrower') {
    return await this.userRepo.findOne({
      where: {
        account_address: address,
      },
      relations: [role == 'borrower' ? 'borrower' : 'lender'],
    });
  }

  async updateLenderCapital(address: string, loanCapital: number) {
    const userLender = await this.userRepo.findOne({
      where: { account_address: address },
      relations: ['lender'],
    });
    if (!userLender) {
      throw new Error('Lender not found');
    }
    userLender.lender!.available_capital -= loanCapital;
    return await this.lenderRepo.save(userLender.lender!);
  }
}
