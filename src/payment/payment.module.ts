import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PAYMENT_GATEWAY_SERVICE } from '../services/interfaces/payment-gateway-service.interface';
import { MidtransService } from '../midtrans/midtrans.service';
import { MidtransModule } from '../midtrans/midtrans.module';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma-service/prisma.service';
import { ApiKeyManagerService } from '../api-key-manager/api-key-manager.service';

@Module({
  imports: [MidtransModule],
  providers: [
    PaymentService,
    ConfigService,
    PrismaService,
    ApiKeyManagerService,
    {
      provide: PAYMENT_GATEWAY_SERVICE,
      useClass: MidtransService,
    },
  ],
  controllers: [PaymentController],
})
export class PaymentModule {}
