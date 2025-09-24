import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './types/LoginDto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: LoginDto,
  ): Promise<ApiResponse<{ access_token: string }>> {
    try {
      const user = await this.authService.validateUser(
        body.userAddress,
        body.signature,
        body.userRole,
      );

      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials',
          error: 'Invalid credentials',
        };
      }

      const access_token = this.authService.login(user).data!.access_token;

      return {
        success: true,
        message: 'Login success',
        data: { access_token },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  }

  @Post('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Request() req) {
    return req.user;
  }
}
