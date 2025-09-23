import { forwardRef, Module } from '@nestjs/common';
import { LoanDbService } from './loanDb.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanDbController } from './LoanDb.controller';
import { LoanBlockchainModule } from '../blockchain/LoanBlockchain.module';
import { LoanEntity } from './entities/loan.entity';
import { InstallmentEntity } from './entities/installment.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoanEntity]),
    TypeOrmModule.forFeature([InstallmentEntity]),
    forwardRef(() => LoanBlockchainModule),
    AuthModule,
  ],
  providers: [LoanDbService],
  controllers: [LoanDbController],
  exports: [LoanDbService, TypeOrmModule],
})
export class LoanDbModule {}
