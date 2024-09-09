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
  paymentUrl: string;

  @ApiProperty()
  paymentToken: string;
}
