import { Module } from '@nestjs/common';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { LoanService } from './loan/loan.service';
import { LoanModule } from './loan/loan.module';

@Module({
  controllers: [BlockchainController],
  providers: [BlockchainService, LoanService],
  imports: [LoanModule]
})
export class BlockchainModule {}
