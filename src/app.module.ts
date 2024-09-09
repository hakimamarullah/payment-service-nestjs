import { Module } from '@nestjs/common';
import { MidtransModule } from './midtrans/midtrans.module';
import { PrismaServiceModule } from './prisma-service/prisma-service.module';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from './payment/payment.module';
import { ApiKeyManagerModule } from './api-key-manager/api-key-manager.module';
import { EventListenerModule } from './event-listener/event-listener.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { PrismaService } from './prisma-service/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { AppPropertiesModule } from './app-properties/app-properties.module';
import { JwtConfigService } from './auth/jwt-config.service';
import { AppPropertiesService } from './app-properties/app-properties.service';
import { CachingService } from './caching/caching.service';
import { CacheModule } from '@nestjs/cache-manager';
import cachingConfig from './common/config/caching.config';

@Module({
  imports: [
    MidtransModule,
    PrismaServiceModule,
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    CacheModule.register(cachingConfig),
    EventEmitterModule.forRoot({ global: true }),
    JwtModule.registerAsync({
      imports: [AppPropertiesModule],
      useClass: JwtConfigService,
      inject: [JwtConfigService, AppPropertiesService],
    }),
    PaymentModule,
    ApiKeyManagerModule,
    EventListenerModule,
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
  ],
})
export class AppModule {}
