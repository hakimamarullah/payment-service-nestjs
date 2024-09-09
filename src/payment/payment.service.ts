import { Inject, Injectable } from '@nestjs/common';
import {
  PAYMENT_GATEWAY_SERVICE,
  PaymentGatewayService,
} from '../services/interfaces/payment-gateway-service.interface';
import { OrderRequest } from './dto/request/order.request';
import { HttpClientBase } from '../services/http-client.base';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma-service/prisma.service';
import { PaymentStatus } from '@prisma/client';
import { PaymentRequestDto } from '../services/dto/payment-request.dto';
import { BaseResponse } from '../common/dto/base-response.dto';
import axios, { AxiosRequestConfig } from 'axios';
import { OrderResponse } from './dto/response/order.response';

@Injectable()
export class PaymentService extends HttpClientBase {
  private apiKeyManagerBaseUrl: string;
  private authBaseUrl: string;
  constructor(
    @Inject(PAYMENT_GATEWAY_SERVICE)
    private midtransService: PaymentGatewayService,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    super();
    this.init();
  }

  public init() {
    const authToken = this.configService.get<string>('AUTH_BEARER_TOKEN', '');
    this.apiKeyManagerBaseUrl = this.configService.get<string>(
      'API_KEY_MANAGER_BASE_URL',
      '',
    );
    this.authBaseUrl = this.configService.get<string>('AUTH_BASE_URL', '');
    this.httpClient = axios.create({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    } as AxiosRequestConfig);
    this.initLogger();
  }
  async buyApiKey(orderRequest: OrderRequest) {
    const { responseData: apiKeyTierInfo } = await this.handleRequest(
      'get',
      `${this.apiKeyManagerBaseUrl}/api-key-manager/tiers/${orderRequest.tierId}/details`,
    );

    const { responseData: userInfo } = await this.handleRequest(
      'get',
      `${this.authBaseUrl}/users/${orderRequest.customerName}/details`,
    );

    if (apiKeyTierInfo.name === 'FREE') {
      const transaction = await this.prismaService.transactions.create({
        data: {
          customerName: orderRequest.customerName,
          tierId: apiKeyTierInfo.id,
          adminFee: 0.0,
          amount: apiKeyTierInfo.price,
          status: PaymentStatus.PAID,
          currency: 'IDR',
          note: `Free Tier (No charge)`,
        },
      });
      return BaseResponse.getSuccessResponse(transaction);
    }

    const transaction = (await this.prismaService.transactions.create({
      data: {
        customerName: orderRequest.customerName,
        tierId: apiKeyTierInfo.id,
        adminFee: 0.0,
        amount: apiKeyTierInfo.price,
        status: PaymentStatus.PENDING,
        vendorName: 'Midtrans',
        currency: 'IDR',
        note: `Buy API Key (Tier: ${apiKeyTierInfo.name})`,
      },
    })) as any;

    const itemDetails = {
      id: apiKeyTierInfo.id,
      price: apiKeyTierInfo.price,
      name: apiKeyTierInfo.name,
      quantity: 1,
    };

    const transactionDetails = {
      order_id: transaction.id,
      gross_amount: apiKeyTierInfo.price,
    };

    const customerDetails = {
      first_name: orderRequest.customerName,
      phone: userInfo.phone,
    };

    const payload = {
      customer_details: customerDetails,
      transaction_details: transactionDetails,
      item_details: [itemDetails],
    };

    const paymentReq = new PaymentRequestDto(payload);
    const response = this.midtransService.createPayment(paymentReq);
    const { token: snapToken } = await response;
    await this.prismaService.transactions.update({
      where: {
        id: transaction.id,
      },
      data: {
        vendorPaymentToken: snapToken,
      },
    });
    const orderResponse = new OrderResponse();
    orderResponse.trxId = transaction.id;
    orderResponse.amount = transaction.amount;
    orderResponse.paymentUrl =
      await this.midtransService.getPaymentUrl(snapToken);
    orderResponse.adminFee = transaction.adminFee;
    orderResponse.status = transaction.status;
    return BaseResponse.getSuccessResponse(orderResponse);
  }

  async handleMidtransCallback(body: Record<string, any>) {
    await this.midtransService.handleCallback(body);
    return BaseResponse.getSuccessResponse();
  }
}
