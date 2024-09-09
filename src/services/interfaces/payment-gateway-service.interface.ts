import { PaymentRequestDto } from '../dto/payment-request.dto';

export interface PaymentGatewayService {
  createPayment(paymentRequestDto: PaymentRequestDto): Promise<any>;

  handleCallback(body: any): Promise<any>;

  getPaymentUrl(token?: string): Promise<string>;
}

export const PAYMENT_GATEWAY_SERVICE = Symbol('PaymentGatewayService');
