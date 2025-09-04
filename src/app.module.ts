import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from './wallet/wallet.module';
import {ConfigModule} from "@nestjs/config";
import { BlockchainModule } from './blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
      WalletModule,
      BlockchainModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
