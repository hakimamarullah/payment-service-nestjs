import { PaymentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class TrxInquiryResponse {
  @ApiProperty()
  trxId: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  adminFee: number;

  @ApiProperty()
  paymentStatus: PaymentStatus;

  @ApiProperty()
  tierId: number;

  @ApiProperty()
  tierName: string;

  @ApiProperty()
  paymentUrl: string | undefined;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static build(
    data: any,
    tierData?: any,
    paymentUrl?: string,
  ): TrxInquiryResponse {
    const trxInquiryResponse = new TrxInquiryResponse();
    trxInquiryResponse.trxId = data?.id;
    trxInquiryResponse.customerName = data?.customerName;
    trxInquiryResponse.paymentStatus = data?.status;
    trxInquiryResponse.tierId = data?.tierId;
    trxInquiryResponse.amount = data?.amount;
    trxInquiryResponse.adminFee = data?.adminFee;
    trxInquiryResponse.tierName = tierData?.name;
    trxInquiryResponse.createdAt = data?.createdAt;
    trxInquiryResponse.updatedAt = data?.updatedAt;
    trxInquiryResponse.paymentUrl = paymentUrl;
    return trxInquiryResponse;
  }
}
