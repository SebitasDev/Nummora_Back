import { Module } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { InvestmentController } from './investment.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [InvestmentService],
  controllers: [InvestmentController],
})
export class InvestmentModule {}
