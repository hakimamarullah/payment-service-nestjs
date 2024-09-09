import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { OrderRequest } from './dto/request/order.request';
import { ApiBaseResponse } from '../common/decorators/swagger.decorator';
import { OrderResponse } from './dto/response/order.response';

@ApiTags('PaymentController')
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('buy-api-key')
  @ApiOperation({ summary: 'Buy API Key' })
  @HttpCode(HttpStatus.OK)
  @ApiBaseResponse({ model: OrderResponse })
  @ApiBody({ type: OrderRequest })
  async buyApiKey(@Body() orderRequest: OrderRequest) {
    return await this.paymentService.buyApiKey(orderRequest);
  }

  @Post('/midtrans/notification')
  @ApiOperation({ summary: 'Midtrans Webhook' })
  @HttpCode(HttpStatus.OK)
  @ApiBaseResponse({ model: Object })
  async midtransPaymentNotification(@Body() notification: Record<string, any>) {
    return await this.paymentService.handleMidtransCallback(notification);
  }
}
