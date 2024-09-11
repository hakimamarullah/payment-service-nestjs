import { ApiProperty } from '@nestjs/swagger';

export class OrderResponse {
  @ApiProperty()
  trxId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  adminFee: number;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  paymentUrl: string;

  @ApiProperty()
  paymentToken: string;

  @ApiProperty()
  tierId: number;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  tierName: string;

  static build(data: any): OrderResponse {
    const orderResponse = new OrderResponse();
    orderResponse.trxId = data?.trxId;
    orderResponse.status = data?.status;
    orderResponse.adminFee = data?.adminFee;
    orderResponse.amount = data?.amount;
    orderResponse.paymentUrl = data?.paymentUrl;
    orderResponse.paymentToken = data?.paymentToken;
    orderResponse.tierId = data?.tierId;
    orderResponse.customerName = data?.customerName;
    orderResponse.tierName = data?.tierName;
    orderResponse.currency = data?.currency;
    return orderResponse;
  }
}
