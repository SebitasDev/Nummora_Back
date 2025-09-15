import { forwardRef, Module } from '@nestjs/common';
import { LoanDbService } from './loanDb.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanDbController } from './LoanDb.controller';
import { LoanBlockchainModule } from '../blockchain/LoanBlockchain.module';
import { LoanEntity } from './entities/loan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoanEntity]),
    forwardRef(() => LoanBlockchainModule),
  ],
  providers: [LoanDbService],
  controllers: [LoanDbController],
  exports: [LoanDbService, TypeOrmModule],
})
export class LoanDbModule {}
