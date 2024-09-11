import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { PrismaService } from '../prisma-service/prisma.service';
import { ApiKeyManagerService } from '../api-key-manager/api-key-manager.service';

@Module({
  providers: [SchedulerService, PrismaService, ApiKeyManagerService],
})
export class SchedulerModule {}
