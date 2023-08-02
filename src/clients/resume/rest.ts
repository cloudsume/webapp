import { fromJSON } from '@ultimicro/json-mapper';
import { Client, ResponseError, Service } from '@/clients/rest';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';
import { CreateResume, CreateResumeLink, DataUpdateResult, LinkAccess, Resume, ResumeLink, ResumeSummary } from './models';

export class ResumeService extends Service {
  constructor(client: Client) {
    super(client, '/resumes');
  }

  async create(req: CreateResume): Promise<Resume> {
    const res = await this.invoke('POST', '', req);
    const json = await res.json();

    return fromJSON(json, Resume);
  }

  async list(): Promise<ResumeSummary[]> {
    const res = await this.invoke('GET', '');
    const json = await res.json();

    return fromJSON(json, Array, ResumeSummary);
  }

  async get(id: Uuid): Promise<Resume> {
    const response = await this.invoke('GET', `/${id}`);
    const json = await response.json();

    return fromJSON(json, Resume);
  }

  async delete(id: Uuid): Promise<void> {
    await this.invoke('DELETE', `/${id}`);
  }

  async setName(id: Uuid, name: string): Promise<void> {
    await this.invoke('PUT', `/${id}/name`, name);
  }

  async setTemplate(id: Uuid, template: ULID): Promise<string[]> {
    const res = await this.invoke('PUT', `/${id}/template`, template);
    const json = await res.json();

    return fromJSON(json, Array, String);
  }

  async setRecruitmentConsent(id: Uuid, value: boolean): Promise<void> {
    await this.invoke('PUT', `/${id}/recruitment-consent`, value);
  }

  async createLink(id: Uuid, req: CreateResumeLink): Promise<ResumeLink> {
    const res = await this.invoke('POST', `/${id}/links`, req);
    const json = await res.json();

    return fromJSON(json, ResumeLink);
  }

  async deleteLink(id: Uuid, link: string): Promise<void> {
    await this.invoke('DELETE', `/${id}/links/${link}`);
  }

  async listLinkAccesses(id: Uuid, link: string, skipTill?: ULID): Promise<LinkAccess[]> {
    const query = (skipTill !== undefined) ? `?skip_till=${skipTill}` : '';
    const res = await this.invoke('GET', `/${id}/links/${link}/accesses${query}`);
    const json = await res.json();

    return fromJSON(json, Array, LinkAccess);
  }

  async setLinkCensorships(id: Uuid, link: string, censorships: string[]) {
    await this.invoke('PUT', `/${id}/links/${link}/censorships`, censorships);
  }

  async patchData(id: Uuid, patch: FormData): Promise<DataUpdateResult> {
    const response = await this.invoke('PATCH', `/${id}/data`, patch);
    const json = await response.json();

    return fromJSON(json, DataUpdateResult);
  }

  async download(id: Uuid, progress?: (received: number) => void): Promise<string> {
    // invoke server api
    const response = await this.invoke('GET', `/${id}.pdf`);

    if (!response.body) {
      throw new ResponseError('No body in the response.', response);
    }

    // stream body to other response to track progress
    const reader = response.body.getReader();
    const data = new ReadableStream({
      start: async function (controller) {
        let received = 0;

        for (;;) {
          if (progress) {
            progress(received);
          }

          const { value } = await reader.read();

          if (!value) {
            controller.close();
            break;
          }

          controller.enqueue(value);
          received += value.length;
        }
      }
    });

    const result = new Response(data);
    const body = await result.blob();

    return URL.createObjectURL(body);
  }
}
