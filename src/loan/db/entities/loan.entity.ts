import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BorrowerEntity } from '../../../user/entities/borrower.entity';
import { LenderEntity } from '../../../user/entities/lender.entity';
import { LoanStatusEnum } from '../enums/loanStatus.enum';

@Entity('loans')
export class LoanEntity {
  //TODO: agg historial de pagos y cuantos pagos se han realizado y cuanto falta por pagar
  @Column('uuid', { primary: true, generated: 'uuid' })
  id: string;

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

  @Column({
    type: 'int',
    default: LoanStatusEnum.PENDING,
    transformer: {
      to: (value: LoanStatusEnum): number => value,
      from: (value: number): string => LoanStatusEnum[value],
    },
  })
  status: LoanStatusEnum;

  @ManyToOne(() => BorrowerEntity, (borrower) => borrower.id, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'borrower_id' })
  borrower: BorrowerEntity;

  @ManyToOne(() => LenderEntity, (lender) => lender.id, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'lender_id' })
  lender?: LenderEntity;
}
