import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';
import { LoanEntity } from '../../loan/db/entities/loan.entity';

@Entity('lenders')
export class LenderEntity {
  @Column('uuid', { primary: true, generated: 'uuid' })
  id: string;

  @Column('uuid', { nullable: false })
  user_id: string;

  @Column('decimal', {
    nullable: false,
    transformer: {
      to: (value: number) => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  available_capital: number;

  @OneToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => LoanEntity, (loan) => loan.id, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  loans?: LoanEntity[];
}
