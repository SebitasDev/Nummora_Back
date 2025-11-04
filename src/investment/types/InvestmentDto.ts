import { IsNumber, IsString, Matches } from 'class-validator';
import { Address } from 'viem';

export class InvestmentDto {
  @IsString()
  @Matches(/^0x[a-fA-F0-9]+$/, {
    message: 'Signature must be a valid hex string starting with 0x',
  })
  signature: `0x${string}`;

  @IsNumber()
  amount: number;

  userAddress: Address;

  tokenAddress: Address;
}
