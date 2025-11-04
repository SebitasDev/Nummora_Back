import { Body, Controller, Post } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { InvestmentDto } from './types/InvestmentDto';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post()
  async invest(
    @Body() body: InvestmentDto,
  ): Promise<ApiResponse<{ newAmount: number }>> {
    try {
      console.log(body);

      const newAmount = await this.investmentService.invest(
        body.amount,
        body.userAddress,
        body.tokenAddress,
        body.signature,
      );

      return {
        success: true,
        message: 'Investment success',
        data: { newAmount },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Investment error',
        error: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  }
}
