import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JobStatus, PaymentStatus, PrismaClient } from '@prisma/client';
import * as process from 'process';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly maxRetries: number;
  private readonly delay: number;
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super();

    this.maxRetries = this.configService.get('PRISMA_MAX_RETRIES', 5);
    this.delay = this.configService.get('PRISMA_RETRY_INTERVAL', 1000);
  }

  async onModuleInit(): Promise<void> {
    await this.retryConnect();
  }

  private async retryConnect(attempts: number = 1): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connection successful');
    } catch (error) {
      this.logger.warn(`Attempt ${attempts} failed. Trying again...`);
      if (attempts < this.maxRetries) {
        this.logger.log(`Retrying in ${this.delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, this.delay));
        await this.retryConnect(attempts + 1);
      } else {
        this.logger.error(
          'Max retries reached. Could not connect to the database.',
          error,
        );
        process.exit(1);
      }
    }
  }

  async createGenerateKeyJob(refId: string, status?: JobStatus): Promise<any> {
    return this.generateKeyJob.create({
      data: {
        refId,
        status: status ?? JobStatus.OPEN,
      },
    });
  }

  async findTransactionsByOwnerAndPaymentStatus(
    owner: string,
    paymentStatus: PaymentStatus,
  ): Promise<any[]> {
    return this.transactions.findMany({
      where: {
        AND: [
          {
            customerName: owner,
          },
          {
            status: paymentStatus,
          },
        ],
      },
    });
  }
}
