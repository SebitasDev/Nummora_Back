import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UserBlockchainService } from './blockchain/UserBlockchain.service';
import { CreateUserDto } from './types/createUserDto';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userBlockchainService: UserBlockchainService) {}

  @Post('register-lender')
  @HttpCode(HttpStatus.CREATED)
  async registerLender(
    @Body() payload: CreateUserDto,
  ): Promise<ApiResponse<{ txHash: string | null }>> {
    try {
      console.log(payload.userAddress);
      const result = await this.userBlockchainService.registerLender(
        payload.userAddress,
        payload.signature,
      );

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
          message: 'Error al registrar el usuario como lender ❌',
          error: errorMessage,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('register-borrower')
  @HttpCode(HttpStatus.CREATED)
  async registerBorrower(
    @Body() payload: CreateUserDto,
  ): Promise<ApiResponse<{ txHash: string | null }>> {
    try {
      const result = await this.userBlockchainService.registerBorrower(
        payload.userAddress,
        payload.signature,
      );

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
          message: 'Error al registrar el usuario como borrower ❌',
          error: errorMessage,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
