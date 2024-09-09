import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from './jwt-config.service';
import { AppPropertiesModule } from '../app-properties/app-properties.module';
import { AppPropertiesService } from '../app-properties/app-properties.service';

@Module({
  providers: [JwtConfigService],
  imports: [
    AppPropertiesModule,
    JwtModule.registerAsync({
      imports: [AppPropertiesModule],
      useClass: JwtConfigService,
      inject: [JwtConfigService, AppPropertiesService],
    }),
  ],
})
export class AuthModule {}
