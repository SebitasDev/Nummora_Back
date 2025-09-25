import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  Address,
  createPublicClient,
  http,
  PublicClient,
  recoverMessageAddress,
} from 'viem';
import { NummoraLoan } from '../abis';
import { celo } from 'viem/chains';
import { Account } from 'viem/accounts';
import { UserService } from '../user/user.service';
import { ApiResponse } from '../common/interfaces/api-response.interface';

interface jwtPayload {
  sub: string;
  address: Address;
  email: string;
  role: number;
}

@Injectable()
export class AuthService {
  private contractAddress = process.env.NUMMORA_CORE_ADDRESS! as `0x${string}`;
  private readonly account: Account;
  private publicClient: PublicClient = createPublicClient({
    chain: celo,
    transport: http(celo.rpcUrls.default.http[0]),
  }) as unknown as PublicClient;

  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async validateUser(
    address: Address,
    signature: `0x${string}`,
    userRole: number,
  ): Promise<jwtPayload | null> {
    const recovered = await recoverMessageAddress({
      message: 'Login to Nummora',
      signature,
    });

    if (recovered.toLowerCase() === address.toLowerCase()) {
      const findUser = (await this.publicClient.readContract({
        address: this.contractAddress,
        abi: NummoraLoan,
        functionName: userRole === 0 ? 'isBorrower' : 'isLender',
        args: [address],
      })) as boolean;

      if (findUser) {
        const user = await this.userService.findByAddress(address, [
          userRole === 0 ? 'borrower' : 'lender',
        ]);
        return {
          sub: user!.id,
          address: address,
          email: user!.email,
          role: userRole,
        };
      }
    }

    return null;
  }

  login(user: jwtPayload): ApiResponse<{ access_token: string }> {
    try {
      const token = this.jwtService.sign(user);

      return {
        success: true,
        message: 'Login successful',
        data: { access_token: token },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  }
}
