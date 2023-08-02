import { fromJSON } from '@ultimicro/json-mapper';
import { Client, Service } from '@/clients/rest';
import { Uuid } from '@/util/uuid';
import { SampleData } from './models';

export class SampleDataEndpoint extends Service {
  constructor(client: Client) {
    super(client, '/sample-data');
  }

  async list(): Promise<SampleData[]> {
    const res = await this.invoke('GET', '');
    const json = await res.json();

    return fromJSON(json, Array, SampleData);
  }

  async patch(job: Uuid, locale: string, patch: FormData): Promise<SampleData[]> {
    const resp = await this.invoke('PATCH', `/${job}/${locale}`, patch);
    const json = await resp.json();

    return fromJSON(json, Array, SampleData);
  }
}
