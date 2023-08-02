export class StripePaymentInfo {
  currency: string;
  amount: number;
  clientSecret: string;

  constructor(currency: string, amount: number, clientSecret: string) {
    this.currency = currency;
    this.amount = amount;
    this.clientSecret = clientSecret;
  }
}
