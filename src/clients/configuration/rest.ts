import { fromJSON } from '@ultimicro/json-mapper';
import { Client, Service } from '@/clients/rest';
import { Configurations } from './models';

export class ConfigurationService extends Service {
  constructor(client: Client) {
    super(client, '/configurations');
  }

  async getAll(): Promise<Configurations> {
    const res = await this.invoke('GET', '');
    const json = await res.json();

    return fromJSON(json, Configurations);
  }

  async getSlackUri(): Promise<string | null> {
    const res = await this.invoke('GET', '/slack-uri');

    if (res.status === 204) {
      return null;
    }

    return fromJSON(await res.json(), String);
  }
}
