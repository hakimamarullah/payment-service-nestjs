import { PaymentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CustomerTrxInquiryRequest {
  @ApiProperty()
  customerName: string;

  @ApiProperty({ type: PaymentStatus, enum: PaymentStatus })
  @IsNotEmpty({ message: 'paymentStatus is required' })
  @IsEnum(PaymentStatus, {
    message: 'paymentStatus must be a valid enum value',
  })
  paymentStatus: PaymentStatus;
}
