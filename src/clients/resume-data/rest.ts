import { fromJSON } from '@ultimicro/json-mapper';
import { Client, Service } from '@/clients/rest';
import { GlobalData, GlobalUpdateResult, ResumeData, ResumeEducation, ResumeSkill } from './models';

export class ResumeDataService extends Service {
  constructor(client: Client) {
    super(client, '/data');
  }

  async all(): Promise<GlobalData[]> {
    const response = await this.invoke('GET', '');
    const json = await response.json();

    return fromJSON(json, Array, GlobalData);
  }

  async list(lang: string): Promise<ResumeData[]> {
    const response = await this.invoke('GET', `/${lang}`);
    const json = await response.json();

    return fromJSON(json, Array, ResumeData);
  }

  async patch(lang: string, patch: FormData): Promise<GlobalUpdateResult> {
    const res = await this.invoke('PATCH', `/${lang}`, patch);
    const json = await res.json();

    return fromJSON(json, GlobalUpdateResult);
  }
}
