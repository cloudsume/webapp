import { Constructor, GenericClass, InvalidProperty, JsonClass, JsonProperty, MappingContext, PolymorphismObject } from '@ultimicro/json-mapper';
import { PaymentProvider } from '@/clients/payment';
import { Uuid } from '@/util/uuid';

export const enum ReceivingMethodStatus {
  SetupRequired = 0x00000000,
  Processing = 0x00000100,
  ActionRequired = 0x00010000,
  Ready = 0x01000000
}

@JsonClass()
export class CreatePaymentReceivingMethod implements PolymorphismObject {
  @JsonProperty({ movable: false })
  type: PaymentProvider;

  constructor(type: PaymentProvider) {
    this.type = type;
  }

  getType(ctx: MappingContext): Constructor | GenericClass {
    switch (this.type) {
      case PaymentProvider.Stripe:
        return CreateStripeReceivingMethod;
      default:
        throw new InvalidProperty(`Unknown method type ${this.type}.`, ctx.pathFor('type'));
    }
  }
}

@JsonClass()
export class CreateStripeReceivingMethod extends CreatePaymentReceivingMethod {
  @JsonProperty()
  country: string;

  constructor(country: string) {
    super(PaymentProvider.Stripe);
    this.country = country;
  }
}

@JsonClass()
export class PaymentReceivingMethod {
  @JsonProperty()
  id: Uuid;

  @JsonProperty()
  type: PaymentProvider;

  @JsonProperty()
  status: ReceivingMethodStatus;

  @JsonProperty()
  createdAt: Date;

  constructor(id: Uuid, type: PaymentProvider, status: ReceivingMethodStatus, createdAt: Date) {
    this.id = id;
    this.type = type;
    this.status = status;
    this.createdAt = createdAt;
  }
}
