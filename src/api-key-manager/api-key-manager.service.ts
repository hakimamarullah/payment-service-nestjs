import { HttpException, Injectable, Logger } from '@nestjs/common';
import { HttpClientBase } from '../services/http-client.base';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma-service/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventConstant } from '../event-listener/event-name.constant';
import axiosRetry from 'axios-retry';

@Injectable()
export class ApiKeyManagerService extends HttpClientBase {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {
    super();
    this.logger = new Logger(ApiKeyManagerService.name);
    this.init();
  }

  protected init() {
    this.httpClient = axios.create({
      baseURL: this.configService.get<string>('API_KEY_MANAGER_BASE_URL', ''),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.configService.get<string>('AUTH_BEARER_TOKEN', '')}`,
      },
      validateStatus: () => true,
    });

    axiosRetry(this.httpClient, {
      retries: 3,
      retryDelay: axiosRetry.linearDelay(1000),
      retryCondition: (error) => error.response?.status !== 200,
    });
    this.initLogger();
  }

  async generateApiKey(
    owner: string,
    tierId: number,
    status: string,
    referenceId?: string,
  ) {
    const payload = {
      username: owner,
      tierId,
      status,
      refId: referenceId,
    };

    const { responseMessage, responseCode } = await this.handleRequest(
      'post',
      '/api-key-manager/generate',
      payload,
    );

    void this.eventEmitter.emitAsync(EventConstant.EventName.LOG_API, {
      path: '/api-key-manager/generate',
      method: 'POST',
      responseMessage: responseMessage,
      responseCode: responseCode,
      reffId: referenceId,
    });

    if (responseCode !== 200) {
      throw new HttpException(responseMessage, responseCode);
    }

    this.logger.log(
      `Generate API KEY Response: ${responseMessage} status: ${responseCode}`,
    );
  }
}
