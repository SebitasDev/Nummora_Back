import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BorrowerEntity } from '../../../user/entities/borrower.entity';
import { LenderEntity } from '../../../user/entities/lender.entity';
import { LoanStatusEnum } from '../enums/loanStatus.enum';
import { InstallmentEntity } from './installment.entity';

@Entity('loans')
export class LoanEntity {
  @Column('uuid', { primary: true, generated: 'uuid' })
  id: string;

  @Column('int', { nullable: true, unique: true })
  loanIdBlockchain?: number;

  @Column('uuid', { nullable: true })
  lender_id?: string;

  @Column('uuid', { nullable: false })
  borrower_id: string;

  @Column('varchar', { nullable: false, length: 42 })
  token: string;

  @Column('decimal', {
    nullable: false,
    transformer: {
      to: (value: number) => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  amount: number;

  @Column('decimal', {
    nullable: false,
    transformer: {
      to: (value: number) => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  interest: number;

  @Column('decimal', {
    nullable: false,
    transformer: {
      to: (value: number) => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  platform_fee: number;

  @Column('int', { nullable: false })
  installments: number;

  @Column('text', { nullable: true })
  description?: string;

  @Column('int', { nullable: false })
  months: number;

  @Column('varchar', { nullable: true })
  tx_hash: string;

  @Column({
    type: 'int',
    default: LoanStatusEnum.PENDING,
    transformer: {
      to: (value: LoanStatusEnum): number => value,
      from: (value: number): string => LoanStatusEnum[value],
    },
  })
  status: LoanStatusEnum;

  @ManyToOne(() => BorrowerEntity, (borrower) => borrower.loans, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'borrower_id' })
  borrower: BorrowerEntity;

  @ManyToOne(() => LenderEntity, (lender) => lender.loans, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'lender_id' })
  lender?: LenderEntity;

  @OneToMany(() => InstallmentEntity, (installment) => installment.loan, {
    cascade: true,
    nullable: false,
  })
  installments_list: InstallmentEntity[];
}
