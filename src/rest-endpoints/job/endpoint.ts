import { fromJSON } from '@ultimicro/json-mapper';
import { Client, Service } from '@/clients/rest';
import { Uuid } from '@/util/uuid';
import { Job } from './models';

export class JobEndpoint extends Service {
  constructor(client: Client) {
    super(client, '/jobs');
  }

  async get(id: Uuid): Promise<Job> {
    const res = await this.invoke('GET', `/${id}`);
    const json = await res.json();

    return fromJSON(json, Job);
  }

  async list(): Promise<Job[]> {
    const res = await this.invoke('GET', '');
    const json = await res.json();

    return fromJSON(json, Array, Job);
  }
}
