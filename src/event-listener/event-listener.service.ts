import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-service/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { EventConstant } from './event-name.constant';

@Injectable()
export class EventListenerService {
  constructor(private prismaService: PrismaService) {}

  @OnEvent(EventConstant.EventName.LOG_API, { async: true })
  async logApi(payload: any) {
    await this.prismaService.apiLog.create({
      data: payload,
    });
  }
}
