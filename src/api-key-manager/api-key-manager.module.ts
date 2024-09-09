import { Module } from '@nestjs/common';
import { ApiKeyManagerService } from './api-key-manager.service';
import { PrismaService } from '../prisma-service/prisma.service';

@Module({
  providers: [ApiKeyManagerService, PrismaService],
  exports: [ApiKeyManagerService],
})
export class ApiKeyManagerModule {}
