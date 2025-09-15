import { forwardRef, Module } from '@nestjs/common';
import { LoanBlockchainService } from './LoanBlockchain.service';
import { UserModule } from '../../user/user.module';
import { LoanDbModule } from '../db/LoanDb.module';

@Module({
  providers: [LoanBlockchainService],
  imports: [UserModule, forwardRef(() => LoanDbModule)],
  exports: [LoanBlockchainService],
})
export class LoanBlockchainModule {}
