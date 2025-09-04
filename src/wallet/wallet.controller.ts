import { Controller, Get, Post, Body } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Get('address')
    getAddress() {
        return { address: this.walletService.getAddress() };
    }

    @Get('balance')
    async getBalance() {
        const balance = await this.walletService.getBalance();
        return { balance };
    }

    @Post('send')
    async send(@Body() body: { to: `0x${string}`; amount: string }) {
        const txHash = await this.walletService.sendTransaction(body.to, body.amount);
        return { txHash };
    }
}
