import { Inject, Injectable } from '@nestjs/common';
import {
  PAYMENT_GATEWAY_SERVICE,
  PaymentGatewayService,
} from '../services/interfaces/payment-gateway-service.interface';
import { OrderRequest } from './dto/request/order.request';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma-service/prisma.service';
import { PaymentStatus } from '@prisma/client';
import { PaymentRequestDto } from '../services/dto/payment-request.dto';
import axios from 'axios';
import { OrderResponse } from './dto/response/order.response';
import {
  BaseResponse,
  HttpClientBase,
  HttpMethod,
} from '@hakimamarullah/commonbundle-nestjs';
import { CustomerTrxInquiryRequest } from './dto/request/customer-trx-inquiry.request';
import { TrxInquiryResponse } from './dto/response/trx-inquiry.response';
import { ApiKeyManagerService } from '../api-key-manager/api-key-manager.service';

@Injectable()
export class PaymentService extends HttpClientBase {
  private apiKeyManagerBaseUrl: string;
  private authBaseUrl: string;
  constructor(
    @Inject(PAYMENT_GATEWAY_SERVICE)
    private midtransService: PaymentGatewayService,
    private configService: ConfigService,
    private prismaService: PrismaService,
    private apiKeyManagerService: ApiKeyManagerService,
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
    });
    this.initClientLogger();
  }
  async buyApiKey(orderRequest: OrderRequest) {
    const { responseData: apiKeyTierInfo } = await this.handleRequest(
      HttpMethod.GET,
      `${this.apiKeyManagerBaseUrl}/api-key-manager/tiers/${orderRequest.tierId}/details`,
    );

    const { responseData: userInfo } = await this.handleRequest(
      HttpMethod.GET,
      `${this.authBaseUrl}/users/${orderRequest.customerName}/details`,
    );

    if (apiKeyTierInfo.name === 'FREE') {
      const transaction = (await this.prismaService.transactions.create({
        data: {
          customerName: orderRequest.customerName,
          tierId: apiKeyTierInfo.id,
          adminFee: 0.0,
          amount: apiKeyTierInfo.price,
          status: PaymentStatus.PAID,
          currency: 'IDR',
          note: `Free Tier (No charge)`,
        },
      })) as any;

      await this.prismaService.createGenerateKeyJob(transaction.id);
      return BaseResponse.getResponse(OrderResponse.build(transaction));
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
    const orderResponse = OrderResponse.build(transaction);
    orderResponse.paymentUrl =
      await this.midtransService.getPaymentUrl(snapToken);
    return BaseResponse.getResponse(orderResponse);
  }

  async handleMidtransCallback(body: Record<string, any>) {
    const isSuccess = await this.midtransService.handleCallback(body);
    return BaseResponse.getResponse(isSuccess);
  }

  async getTransactionById(id: string) {
    const transaction = await this.prismaService.transactions.findFirstOrThrow({
      where: {
        id,
      },
    });
    return BaseResponse.getResponse(transaction);
  }

  async getCustomerTrxByPaymentStatus(inquiryReq: CustomerTrxInquiryRequest) {
    const { customerName, paymentStatus } = inquiryReq;
    const transactions =
      await this.prismaService.findTransactionsByOwnerAndPaymentStatus(
        customerName,
        paymentStatus,
      );

    const results: TrxInquiryResponse[] = [];
    if (transactions) {
      for (const trx of transactions) {
        const { responseData } =
          await this.apiKeyManagerService.getTierDetailsById(trx.tierId);
        const paymentUrl = await this.midtransService.getPaymentUrl(
          trx.vendorPaymentToken,
        );
        results.push(TrxInquiryResponse.build(trx, responseData, paymentUrl));
      }
    }
    return BaseResponse.getResponse<TrxInquiryResponse[]>(results);
  }
}
