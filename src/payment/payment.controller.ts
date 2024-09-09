import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { OrderRequest } from './dto/request/order.request';
import { ApiBaseResponse } from '../common/decorators/swagger.decorator';
import { OrderResponse } from './dto/response/order.response';

@ApiTags('PaymentController')
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('buy-api-key')
  @ApiBearerAuth()
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

  @Get('/transactions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Transaction Details' })
  @HttpCode(HttpStatus.OK)
  @ApiBaseResponse({ model: Object })
  @ApiParam({ name: 'id', type: String })
  async getTransactionDetailsById(@Param('id') id: string) {
    return await this.paymentService.getTransactionById(id);
  }
}
