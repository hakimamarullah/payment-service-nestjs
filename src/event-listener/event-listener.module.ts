import { Module } from '@nestjs/common';
import { EventListenerService } from './event-listener.service';
import { PrismaService } from '../prisma-service/prisma.service';

@Module({
  providers: [EventListenerService, PrismaService],
})
export class EventListenerModule {}
