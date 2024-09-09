import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Logger } from '@nestjs/common';

export abstract class HttpClientBase {
  protected httpClient: AxiosInstance;
  protected logger: Logger = new Logger(HttpClientBase.name);

  protected async handleRequest(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
    payload?: Record<string, any>,
    config: AxiosRequestConfig = {},
  ) {
    const { data } = await this.httpClient.request({
      method,
      url: path,
      data: payload,
      timeout: 10000,
      ...config,
    } as AxiosRequestConfig);
    return data;
  }

  protected initLogger() {
    this.httpClient.interceptors.request.use((request) => {
      const { method, url, headers, data } = request;
      this.logger.debug(
        'Starting Request',
        JSON.stringify({ method, url, headers, data }, null, 2),
      );
      return request;
    });

    this.httpClient.interceptors.response.use((response) => {
      const { status, data } = response;
      this.logger.debug('Response:', JSON.stringify({ status, data }, null, 2));
      return response;
    });
  }
}
