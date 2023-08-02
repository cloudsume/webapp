import { fromJSON } from '@ultimicro/json-mapper';
import { Client, RequestError, Service } from '@/clients/rest';
import { Uuid } from '@/util/uuid';
import { CAPTCHAError } from './errors';
import { CreatePaymentReceivingMethod, PaymentReceivingMethod } from './models';

export class PaymentReceivingMethodService extends Service {
  constructor(client: Client) {
    super(client, '/payment-receiving-methods');
  }

  async create(req: CreatePaymentReceivingMethod): Promise<PaymentReceivingMethod> {
    const res = await this.invoke('POST', '', req);
    const json = await res.json();

    return fromJSON(json, PaymentReceivingMethod);
  }

  async list(): Promise<PaymentReceivingMethod[]> {
    const res = await this.invoke('GET', '');
    const json = await res.json();

    return fromJSON(json, Array, PaymentReceivingMethod);
  }

  async getSetupUri(id: Uuid, captcha: string, returnUri: string): Promise<string> {
    let res;

    try {
      res = await this.invoke('GET', `/${id}/setup-uri?captcha=${captcha}&return_uri=${encodeURIComponent(returnUri)}`);
    } catch (e) {
      let errors;

      if (e instanceof RequestError && (errors = e.errors.get('captcha'))) {
        throw new CAPTCHAError(errors[0], e.response);
      } else {
        throw e;
      }
    }

    return fromJSON(await res.json(), String);
  }
}
