import { Module } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { MidtransController } from './midtrans.controller';
import { ApiKeyManagerService } from '../api-key-manager/api-key-manager.service';
import { PrismaService } from '../prisma-service/prisma.service';

@Module({
  providers: [MidtransService, ApiKeyManagerService, PrismaService],
  controllers: [MidtransController],
})
export class MidtransModule {}
