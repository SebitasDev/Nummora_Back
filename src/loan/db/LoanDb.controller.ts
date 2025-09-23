import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LoanBlockchainService } from '../blockchain/LoanBlockchain.service';
import { CreateLoanDto } from './types/createLoanDto';
import { GenerateLoanDto } from './types/generateLoan.dto';
import { LoanDbService } from './loanDb.service';
import { LoanStatusEnum } from './enums/loanStatus.enum';
import { ApiResponse } from '../../common/interfaces/api-response.interface';
import { PayInstallmentDto } from './types/payInstallmentDto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('loan')
@UseGuards(JwtAuthGuard)
export class LoanDbController {
  constructor(
    private readonly loanBlockchainService: LoanBlockchainService,
    private readonly loanDbService: LoanDbService,
  ) {}
  @Post('finance')
  @HttpCode(HttpStatus.CREATED)
  async financeLoan(
    @Body() payload: CreateLoanDto,
  ): Promise<ApiResponse<{ txHash: string | null }>> {
    try {
      const result = await this.loanBlockchainService.financeLoan(payload);
      return {
        success: true,
        message: 'Préstamo financiado con éxito ✅',
        data: { txHash: result },
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';

      throw new HttpException(
        <ApiResponse>{
          success: false,
          message: 'Error al financiar el préstamo ❌',
          error: errorMessage,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generateLoan(
    @Body() payload: GenerateLoanDto,
  ): Promise<ApiResponse<{ txHash: string | null }>> {
    try {
      const result = await this.loanBlockchainService.generateLoan(payload);
      return {
        success: true,
        message: result.message,
        data: { txHash: result.txHash?.toString() || null },
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';

      throw new HttpException(
        <ApiResponse>{
          success: false,
          message: 'Error al generar el préstamo ❌',
          error: errorMessage,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('pay-installment')
  @HttpCode(HttpStatus.OK)
  async payInstallment(
    @Body() payload: PayInstallmentDto,
  ): Promise<ApiResponse<{ txHash: string | null }>> {
    try {
      const result = await this.loanBlockchainService.payInstallment(payload);
      return {
        success: true,
        message: 'Cuota pagada con éxito ✅',
        data: { txHash: result.toString() || null },
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';

      throw new HttpException(
        <ApiResponse>{
          success: false,
          message: 'Error al pagar la cuota ❌',
          error: errorMessage,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('requests')
  async getLoanRequests() {
    try {
      const loans = await this.loanDbService.getAllLoansByStatus(
        LoanStatusEnum.PENDING,
      );
      return {
        success: true,
        data: loans,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';

      throw new HttpException(
        <ApiResponse>{
          success: false,
          message: 'Error al generar el préstamo ❌',
          error: errorMessage,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
