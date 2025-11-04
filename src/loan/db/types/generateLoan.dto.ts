import { Type } from 'class-transformer';
import { Address } from 'viem';

export class GenerateLoanDto {
  borrowerAddress: Address;

  @Type(() => Number)
  amount: number;

  token: string;

  @Type(() => Number)
  installments: number;

  description?: string;

  @Type(() => Number)
  months: number;
}
