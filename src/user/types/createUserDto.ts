import { IsString, Matches } from 'class-validator';
import { Address } from 'viem';

export class CreateUserDto {
  @IsString()
  @Matches(/^0x[a-fA-F0-9]+$/, {
    message: 'Signature must be a valid hex string starting with 0x',
  })
  signature: `0x${string}`;

  userAddress: Address;
}
