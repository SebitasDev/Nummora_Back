import { Transform } from 'class-transformer';

export class LoanDto {
    lender: string;

    borrower: string;

    token: string;

    @Transform(({ value }) => BigInt(value))
    amount: bigint;

    @Transform(({ value }) => BigInt(value))
    interest: bigint;

    @Transform(({ value }) => BigInt(value))
    installments: bigint;

    @Transform(({ value }) => BigInt(value))
    platformFee: bigint;
    
    dataHash: string;
}