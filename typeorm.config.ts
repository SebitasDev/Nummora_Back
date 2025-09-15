import { DataSource } from 'typeorm';
import { UserEntity } from './src/user/entities/user.entity';
import { LenderEntity } from './src/user/entities/lender.entity';
import { BorrowerEntity } from './src/user/entities/borrower.entity';
import { LoanEntity } from './src/loan/db/entities/loan.entity';

export default new DataSource({
  type: 'postgres',
  url: 'postgresql://postgres:bMjICsVBNDIlTnfecSVDNGNRmxKFYldI@shuttle.proxy.rlwy.net:17504/railway',
  ssl: { rejectUnauthorized: false },
  entities: [
    UserEntity,
    LenderEntity,
    BorrowerEntity,
    LoanEntity,
  ],
  migrations: ['src/migrations/*.ts'],
});
