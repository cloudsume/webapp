import { fromJSON } from '@ultimicro/json-mapper';
import { Client, ResponseError, Service } from '@/clients/rest';
import { Uuid } from '@/util/uuid';
import { CreateGuestSession } from './models';

export class GuestSessionEndpoint extends Service {
  constructor(client: Client) {
    super(client, '/guest-sessions');
  }

  async create(req: CreateGuestSession): Promise<string> {
    const res = await this.invoke('POST', '', req);
    const json = await res.json();

    return fromJSON(json, String);
  }

  async delete(id: Uuid, token?: string): Promise<boolean> {
    const query = token ? `?token=${token}` : '';

    try {
      await this.invoke('DELETE', `/${id}${query}`);
    } catch (e) {
      if (e instanceof ResponseError && e.response.status === 409) {
        return false;
      } else {
        throw e;
      }
    }

    return true;
  }
}
