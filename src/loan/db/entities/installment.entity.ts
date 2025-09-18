import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { LoanEntity } from './loan.entity';

@Entity('installments')
export class InstallmentEntity {
  @Column('uuid', { primary: true, generated: 'uuid' })
  id: string;

  @Column('uuid')
  loan_id: string;

  @Column('int', { nullable: false })
  installment_number: number;

  @Column('decimal', {
    nullable: false,
    transformer: {
      to: (value: number) => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  amount: number;

  @Column('boolean', { default: false })
  paid: boolean;

  @Column('timestamp', { nullable: false })
  due_date: Date;

  @Column('timestamp', { nullable: true })
  paid_at?: Date;

  @ManyToOne(() => LoanEntity, (loan) => loan.installments_list, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'loan_id' })
  loan: LoanEntity;
}
