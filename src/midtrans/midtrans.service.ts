import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PaymentGatewayService } from '../services/interfaces/payment-gateway-service.interface';
import { PaymentRequestDto } from '../services/dto/payment-request.dto';

import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createHash } from 'crypto';
import { MidtransNotification } from './dto/midtrans-notification.dto';
import { PrismaService } from '../prisma-service/prisma.service';
import { PaymentStatus } from '@prisma/client';
import {
  HttpClientBase,
  HttpMethod,
} from '@hakimamarullah/commonbundle-nestjs';

@Injectable()
export class MidtransService
  extends HttpClientBase
  implements PaymentGatewayService
{
  private readonly serverKey: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super();
    this.logger = new Logger(MidtransService.name);
    this.serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY', '');
    this.init();
  }
  public init() {
    const isSandBox = this.configService.get<boolean>(
      'MIDTRANS_IS_SANDBOX',
      false,
    );
    const authToken = Buffer.from(this.serverKey).toString('base64');
    const baseUrl = isSandBox
      ? 'https://app.sandbox.midtrans.com/snap'
      : 'https://app.midtrans.com/snap';
    this.httpClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${authToken}`,
      },
    });
    this.initClientLogger();
  }
  async createPayment(paymentRequestDto: PaymentRequestDto): Promise<any> {
    return await this.handleRequest(
      HttpMethod.POST,
      '/v1/transactions',
      paymentRequestDto.getPayload(),
    );
  }

  async handleCallback(body: any): Promise<any> {
    this.logger.log(`Midtrans Notification ${JSON.stringify(body)}`);
    const notification = new MidtransNotification(body);
    if (!this.isValidSignature(notification)) {
      throw new HttpException('invalid signature', HttpStatus.UNAUTHORIZED);
    }

    const transactionId = notification.getTransactionId();
    const transactionStatus = notification.getTransactionStatus();
    const orderId = notification.getOrderId();
    const fraudStatus = notification.getFraudStatus();
    const paymentType = notification.getPaymentType();

    const dataToUpdate = {} as any;
    dataToUpdate.paymentType = paymentType;
    dataToUpdate.vendorTrxId = transactionId;
    dataToUpdate.currency = notification.getCurrency();
    if (this.isPaymentSuccessful(transactionStatus, fraudStatus)) {
      dataToUpdate.status = PaymentStatus.PAID;
    } else if ('pending' !== transactionStatus) {
      dataToUpdate.status = PaymentStatus.CANCELLED;
    }
    const update = await this.prismaService.transactions.update({
      where: {
        id: orderId,
      },
      data: dataToUpdate,
    });

    const { status } = update;
    if (status === PaymentStatus.PAID) {
      await this.prismaService.createGenerateKeyJob(orderId);
    }
    this.logger.log(`END HANDLE CALLBACK ${orderId} data found ${!!update}`);
    return Promise.resolve(true);
  }

  public getSnapRedirectUrl(snapToken: string) {
    return `${this.configService.get('SNAP_REDIRECT_BASE_URL')}/${snapToken}`;
  }

  async getPaymentUrl(token?: string): Promise<string> {
    return Promise.resolve(this.getSnapRedirectUrl(token ?? ''));
  }

  private isPaymentSuccessful(
    transactionStatus: string,
    fraudStatus: string,
  ): boolean {
    return (
      (transactionStatus === 'capture' && fraudStatus === 'accept') ||
      transactionStatus === 'settlement'
    );
  }

  public isValidSignature(notification: MidtransNotification): boolean {
    const orderId = notification.getOrderId();
    const statusCode = notification.getStatusCode();
    const grossAmount = notification.getGrossAmount();
    const signatureKey = notification.getSignatureKey();

    const dataToSign = `${orderId}${statusCode}${grossAmount}${this.serverKey}`;
    const computedSignature = this.createSignature(dataToSign);

    return computedSignature === signatureKey;
  }

  private createSignature(data: string): string {
    return createHash('sha512').update(data).digest('hex');
  }
}
