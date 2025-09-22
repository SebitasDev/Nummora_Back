import { Entity, Column, OneToOne } from 'typeorm';
import { LenderEntity } from './lender.entity';
import { BorrowerEntity } from './borrower.entity';

@Entity('users')
export class UserEntity {
  @Column('uuid', { primary: true, generated: 'uuid' })
  id: string;

  @Column('varchar', { nullable: false, length: 60 })
  first_name?: string;

  @Column('varchar', { nullable: false, length: 60 })
  last_name?: string;

  @Column('text', { nullable: true })
  email: string;

  @Column('varchar', { nullable: false, length: 42 })
  account_address: string;

  @OneToOne(() => LenderEntity, (lender) => lender.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  lender?: LenderEntity;

  @OneToOne(() => BorrowerEntity, (borrower) => borrower.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  borrower?: BorrowerEntity;
}
