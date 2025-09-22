import { forwardRef, Module } from '@nestjs/common';
import { UserBlockchainService } from './UserBlockchain.service';
import { UserModule } from '../user.module';

@Module({
  providers: [UserBlockchainService],
  imports: [forwardRef(() => UserModule)],
  exports: [UserBlockchainService],
})
export class UserBlockchainModule {}
