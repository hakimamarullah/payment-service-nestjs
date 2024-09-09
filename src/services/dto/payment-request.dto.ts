export class PaymentRequestDto {
  private readonly data: Record<string, any>;

  constructor(data?: Record<string, any>) {
    this.data = data ?? {};
  }

  public getAsString(key: string): string | undefined {
    return key in this.data ? String(this.data[key]) : undefined;
  }

  public getAsNumber(key: string): number | undefined {
    return key in this.data ? Number(this.data[key]) : undefined;
  }

  public getAsBoolean(key: string): boolean | undefined {
    return key in this.data ? Boolean(this.data[key]) : undefined;
  }

  public getAsObject(key: string): Record<string, any> | undefined {
    return key in this.data ? this.data[key] : undefined;
  }

  public getAsDate(key: string): Date | undefined {
    const value = this.data[key];
    return value ? new Date(value) : undefined;
  }

  public getAsArray(key: string): any[] | undefined {
    return key in this.data ? this.data[key] : undefined;
  }

  public getPayload() {
    return this.data;
  }
}
