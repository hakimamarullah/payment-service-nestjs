import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
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
import { OrderResponse } from './dto/response/order.response';
import {
  ApiBaseResponse,
  getUsername,
  Public,
} from '@hakimamarullah/commonbundle-nestjs';
import { Request } from 'express';
import { CustomerTrxInquiryRequest } from './dto/request/customer-trx-inquiry.request';
import { TrxInquiryResponse } from './dto/response/trx-inquiry.response';

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
  @Public()
  @ApiOperation({ summary: 'Midtrans Webhook' })
  @HttpCode(HttpStatus.OK)
  @ApiBaseResponse({ model: Object })
  @ApiBody({ type: Object })
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

  @Get('/transactions/users/me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get Current User's Transactions by Payment Status",
  })
  @HttpCode(HttpStatus.OK)
  @ApiBaseResponse({ model: TrxInquiryResponse, isArray: true })
  @ApiBody({ type: CustomerTrxInquiryRequest })
  async getMyTransactions(
    @Req() req: Request,
    @Body() inquiryReq: CustomerTrxInquiryRequest,
  ) {
    inquiryReq.customerName = getUsername(req);
    return await this.paymentService.getCustomerTrxByPaymentStatus(inquiryReq);
  }
}
