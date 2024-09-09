import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class OrderRequest {
  @ApiProperty()
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'tierId must be a number' },
  )
  tierId: number;

  @ApiProperty()
  @IsString({ message: 'customerName must be a string' })
  @IsNotEmpty({ message: 'customerName is required' })
  customerName: string;
}
