import { Module } from '@nestjs/common';
import { MidtransModule } from './midtrans/midtrans.module';
import { PrismaServiceModule } from './prisma-service/prisma-service.module';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from './payment/payment.module';
import { ApiKeyManagerModule } from './api-key-manager/api-key-manager.module';
import { EventListenerModule } from './event-listener/event-listener.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    MidtransModule,
    PrismaServiceModule,
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    EventEmitterModule.forRoot({ global: true }),
    PaymentModule,
    ApiKeyManagerModule,
    EventListenerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
