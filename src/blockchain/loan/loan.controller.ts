import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { LoanService } from './loan.service';
import { LoanDto } from './types/loan.dto';

@Controller('blockchain/loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}
  @Post('finance')
  async financeLoan(@Body() payload: LoanDto) {
    try {
      const result = await this.loanService.createLoan(payload);
      return {
        message: 'Transacción enviada correctamente ✅',
        txHash: result,
      };
    } catch (err) {
      throw new HttpException({ error: err.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
