import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';
import { LoanEntity } from '../../loan/db/entities/loan.entity';

@Entity('borrowers')
export class BorrowerEntity {
  @Column('uuid', { primary: true, generated: 'uuid' })
  id: string;

  @Column('uuid', { nullable: false })
  user_id: string;

  @Column('decimal', { nullable: false })
  loan_limit: number;

  @Column('int', { nullable: false })
  reputation_score: number;

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
