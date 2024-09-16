import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma-service/prisma.service';
import { ApiKeyManagerService } from '../api-key-manager/api-key-manager.service';
import { JobStatus, PaymentStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { stringTimeunitToMillis } from '@hakimamarullah/commonbundle-nestjs';

@Injectable()
export class SchedulerService {
  private logger: Logger = new Logger(SchedulerService.name);
  constructor(
    private prismaService: PrismaService,
    private apiKeyManager: ApiKeyManagerService,
    private configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async generateApiKey() {
    this.logger.log('JOB: GENERATE API KEY STARTED');
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(startOfToday.getDate() + 1);

    const todayJobs = await this.prismaService.generateKeyJob.findMany({
      where: {
        status: JobStatus.OPEN,
        createdAt: {
          gte: startOfToday,
          lt: endOfToday,
        },
      },
    });
    if (!todayJobs?.length) {
      this.logger.log('No jobs found for today');
    }

    const orderIds = todayJobs.map((job: any) => <string>job.refId);
    const transactions = await this.prismaService.transactions.findMany({
      where: {
        id: {
          in: orderIds,
        },
      },
    });
    const requestsPayload = transactions.map((transaction: any) => {
      return {
        owner: transaction.customerName,
        tierId: transaction.tierId,
        referenceId: transaction.id,
        status: 'ACTIVE',
      };
    });

    for (const payload of requestsPayload) {
      let status: JobStatus;
      let error = undefined;
      try {
        const { responseCode, responseMessage } =
          await this.apiKeyManager.generateApiKey(
            payload.owner,
            payload.tierId,
            payload.status,
            payload.referenceId,
          );
        status = responseCode !== 200 ? JobStatus.FAILED : JobStatus.DONE;
        error = responseCode !== 200 ? responseMessage : undefined;
      } catch (err) {
        this.logger.error(err);
        status = JobStatus.FAILED;
        error = err.message;
      }

      await this.prismaService.generateKeyJob.update({
        where: {
          refId: payload.referenceId,
        },
        data: {
          status,
          error,
        },
      });
    }
    this.logger.log('JOB: GENERATE API KEY COMPLETED');
  }

  @Cron(CronExpression.EVERY_30_SECONDS) // Adjust the cron expression as needed
  async handleCron() {
    const threshold = this.configService.get<string>(
      'TRANSACTION_THRESHOLD',
      '10m',
    );
    this.logger.log(`Cron job started. Transaction threshold: ${threshold}`);
    const thresholdInMilliseconds = stringTimeunitToMillis(threshold);
    const now = new Date();

    const { count } = await this.prismaService.transactions.updateMany({
      where: {
        status: PaymentStatus.PENDING,
        createdAt: {
          lt: new Date(now.getTime() - thresholdInMilliseconds),
        },
      },
      data: {
        status: PaymentStatus.CANCELLED,
        note: 'Transaction expired',
      },
    });

    this.logger.log(`Cron job completed. ${count} transactions cancelled.`);
  }
}
