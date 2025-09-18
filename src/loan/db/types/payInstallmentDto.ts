import { IsString, IsUUID, Matches } from 'class-validator';

export class PayInstallmentDto {
  @IsUUID()
  loanId: string;

  @IsString()
  @Matches(/^0x[a-fA-F0-9]+$/, {
    message: 'Signature must be a valid hex string starting with 0x',
  })
  signature: `0x${string}`;
}
