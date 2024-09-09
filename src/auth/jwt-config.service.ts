import { Injectable, Logger } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import * as process from 'process';
import { AppPropertiesService } from '../app-properties/app-properties.service';
import { HttpClientBase } from '../services/http-client.base';
import axios from 'axios';

@Injectable()
export class JwtConfigService
  extends HttpClientBase
  implements JwtOptionsFactory
{
  constructor(private appProperties: AppPropertiesService) {
    super();
    this.logger = new Logger(JwtConfigService.name);
    this.init();
  }

  protected init() {
    this.httpClient = axios.create({
      baseURL: this.appProperties.getAuthServiceBaseUrl(),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.appProperties.getAuthServiceToken()}`,
      },
    });
    this.initLogger();
  }

  async createJwtOptions(): Promise<JwtModuleOptions> {
    const config = await this.loadJwtOptions();
    if (!config.secret || !config.signOptions) {
      this.logger.fatal('JWT_SECRET or JWT_EXPIRES is not defined');
      process.exit(1);
    }
    return config;
  }

  async loadJwtOptions(): Promise<JwtModuleOptions> {
    this.appProperties.getAuthServiceBaseUrl();
    const { responseData } = await this.handleRequest('get', `/jwt/config`);
    return responseData as JwtModuleOptions;
  }
}
