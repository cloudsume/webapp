import { PaymentReceivingMethod } from '@/clients/payment-receiving-method';

export const ContextKey = Symbol();

export class Context {
  methods: PaymentReceivingMethod[];

  constructor() {
    this.methods = [];
  }
}
