import { fromJSON } from '@ultimicro/json-mapper';
import { Client, Service } from '@/clients/rest';
import { ULID } from '@/util/ulid';
import { Template } from './models';

export class TemplateService extends Service {
  constructor(client: Client) {
    super(client, '/templates');
  }

  async get(id: ULID): Promise<Template> {
    const res = await this.invoke('GET', `/${id}`);
    const json = await res.json();

    return fromJSON(json, Template);
  }
}
