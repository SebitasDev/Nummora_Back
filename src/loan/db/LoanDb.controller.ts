import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { LoanBlockchainService } from '../blockchain/LoanBlockchain.service';
import { CreateLoanDto } from './types/createLoanDto';
import { GenerateLoanDto } from './types/generateLoan.dto';
import { LoanDbService } from './loanDb.service';
import { LoanStatusEnum } from './enums/loanStatus.enum';

@Controller('loan')
export class LoanDbController {
  constructor(
    private readonly loanBlockchainService: LoanBlockchainService,
    private readonly loanDbService: LoanDbService,
  ) {}
  @Post('finance')
  async financeLoan(@Body() payload: CreateLoanDto) {
    try {
      const result = await this.loanBlockchainService.financeLoan(payload);
      return {
        message: 'Prestamo financiado correctamente ✅',
        txHash: result,
      };
    } catch (err) {
      throw new HttpException({ error: err.error }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('generate')
  async generateLoan(@Body() payload: GenerateLoanDto) {
    try {
      const result = await this.loanBlockchainService.generateLoan(payload);
      return {
        message: result.message,
        txHash: result.txHash,
      };
    } catch (err) {
      throw new HttpException({ error: err.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('requests')
  async getLoanRequests() {
    try {
      return await this.loanDbService.getAllLoansByStatus(
        LoanStatusEnum.PENDING,
      );
    } catch (err) {
      throw new HttpException({ error: err.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
