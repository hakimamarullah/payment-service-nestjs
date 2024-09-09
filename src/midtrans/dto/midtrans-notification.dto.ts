export class MidtransNotification {
  private readonly payload: Record<string, any>;

  constructor(payload: Record<string, any>) {
    this.payload = payload;
  }

  public getTransactionId(): string {
    return this.payload['transaction_id'];
  }

  public getTransactionStatus(): string {
    return this.payload['transaction_status'];
  }

  public getFraudStatus(): string {
    return this.payload['fraud_status'];
  }

  public getOrderId(): string {
    return this.payload['order_id'];
  }

  public getPaymentType(): string {
    return this.payload['payment_type'];
  }

  public getStatusCode(): string {
    return this.payload['status_code'];
  }

  public getGrossAmount(): string {
    return this.payload['gross_amount'];
  }

  public getSignatureKey(): string {
    return this.payload['signature_key'];
  }

  public getCurrency(): string {
    return this.payload['currency'];
  }
}
