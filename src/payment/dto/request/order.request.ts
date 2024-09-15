import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class OrderRequest {
  @ApiProperty()
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'tierId must be a number' },
  )
  tierId: number;

  customerName: string;
}
