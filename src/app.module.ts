import { Module } from '@nestjs/common';
import { MidtransModule } from './midtrans/midtrans.module';
import { PrismaServiceModule } from './prisma-service/prisma-service.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentModule } from './payment/payment.module';
import { ApiKeyManagerModule } from './api-key-manager/api-key-manager.module';
import { EventListenerModule } from './event-listener/event-listener.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './prisma-service/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { AppPropertiesModule } from './app-properties/app-properties.module';
import { AppPropertiesService } from './app-properties/app-properties.service';
import { CacheModule } from '@nestjs/cache-manager';
import {
  AuthGuard,
  cachingConfig,
  CachingService,
  JwtConfigService,
} from '@hakimamarullah/commonbundle-nestjs';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MidtransModule,
    PrismaServiceModule,
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    CacheModule.register(cachingConfig),
    EventEmitterModule.forRoot({ global: true }),
    ScheduleModule.forRoot({ cronJobs: true }),
    JwtModule.registerAsync({
      imports: [AppPropertiesModule],
      useClass: JwtConfigService,
      inject: [JwtConfigService, AppPropertiesService],
    }),
    PaymentModule,
    ApiKeyManagerModule,
    EventListenerModule,
    SchedulerModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    PrismaService,
    CachingService,
    AppPropertiesService,
    ConfigService,
  ],
})
export class AppModule {}
