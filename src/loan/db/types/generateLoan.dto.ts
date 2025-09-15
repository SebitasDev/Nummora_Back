import { Type } from 'class-transformer';

export class GenerateLoanDto {
  borrowerId: string;

  @Type(() => Number)
  amount: number;

  token: string;

  @Type(() => Number)
  installments: number;

  description?: string;

  @Type(() => Number)
  months: number;
}
