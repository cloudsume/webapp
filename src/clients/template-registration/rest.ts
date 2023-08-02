import { fromJSON } from '@ultimicro/json-mapper';
import { Client, ResponseError, Service } from '@/clients/rest';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';
import {
  CancelPurchaseReason,
  EducationOptions,
  ExperienceOptions,
  PaymentMethod,
  RegisterTemplate,
  RegistrationCategory,
  ReleaseTemplate,
  SkillOptions,
  TemplateAsset,
  TemplateLicense,
  TemplateRegistration,
  TemplateSummary,
  TemplateWorkspace,
  WorkspaceBuildError,
  WorkspacePreview
} from './models';

export class TemplateRegistrationService extends Service {
  constructor(client: Client) {
    super(client, '/template-registrations');
  }

  async register(data: RegisterTemplate): Promise<TemplateRegistration> {
    const res = await this.invoke('POST', '', data);
    const json = await res.json();

    return fromJSON(json, TemplateRegistration);
  }

  async setName(id: Uuid, name: string): Promise<void> {
    await this.invoke('PUT', `/${id}/name`, name);
  }

  async setDescription(id: Uuid, desc: string | null): Promise<void> {
    await this.invoke('PUT', `/${id}/description`, desc);
  }

  async setApplicableJobs(id: Uuid, jobs: Uuid[]): Promise<void> {
    await this.invoke('PUT', `/${id}/applicable-jobs`, jobs);
  }

  async addApplicableJobs(id: Uuid, jobs: Uuid[]): Promise<void> {
    await this.invoke('POST', `/${id}/applicable-jobs`, jobs);
  }

  async setWebsite(id: Uuid, url: string | null): Promise<void> {
    await this.invoke('PUT', `/${id}/website`, url);
  }

  async setCategory(id: Uuid, category: RegistrationCategory): Promise<void> {
    await this.invoke('PUT', `/${id}/category`, category);
  }

  async setPrices(id: Uuid, prices: Map<string, number>): Promise<void> {
    await this.invoke('PUT', `/${id}/prices`, prices);
  }

  async list(owner?: Uuid): Promise<TemplateRegistration[]> {
    const query = owner ? `?owner=${owner}` : '';
    const res = await this.invoke('GET', query);
    const json = await res.json();

    return fromJSON(json, Array, TemplateRegistration);
  }

  async get(id: Uuid): Promise<TemplateRegistration> {
    const res = await this.invoke('GET', `/${id}`);
    const json = await res.json();

    return fromJSON(json, TemplateRegistration);
  }

  async listReleases(id: Uuid): Promise<TemplateSummary[]> {
    const res = await this.invoke('GET', `/${id}/releases`);
    const json = await res.json();

    return fromJSON(json, Array, TemplateSummary);
  }

  async listTemplates(id: Uuid): Promise<ULID[]> {
    const res = await this.invoke('GET', `/${id}/templates`);
    const json = await res.json();

    return fromJSON(json, Array, ULID);
  }

  async getLicense(id: Uuid): Promise<TemplateLicense | null> {
    let res;

    try {
      res = await this.invoke('GET', `/${id}/license`);
    } catch (e) {
      if (e instanceof ResponseError && e.response.status === 404) {
        return null;
      } else {
        throw e;
      }
    }

    if (res.status === 204) {
      return null;
    } else {
      return fromJSON(await res.json(), TemplateLicense);
    }
  }

  async getPaymentMethod(id: Uuid, currency: string, captcha: string): Promise<PaymentMethod | null> {
    const res = await this.invoke('GET', `/${id}/payment-method?currency=${currency}&captcha=${captcha}`);

    if (res.status === 204) {
      return null;
    }

    return fromJSON(await res.json(), PaymentMethod);
  }

  async writeCancelPurchaseFeedback(id: Uuid, reason: CancelPurchaseReason) {
    await this.invoke('POST', `/${id}/cancel-purchase-feedbacks`, reason);
  }

  async getWorkspace(id: Uuid): Promise<TemplateWorkspace> {
    const res = await this.invoke('GET', `/${id}/workspace`);
    const json = await res.json();

    return fromJSON(json, TemplateWorkspace);
  }

  async writeWorkspaceAsset(id: Uuid, name: string, data: Blob): Promise<TemplateAsset> {
    const res = await this.invoke('PUT', `/${id}/workspace/assets/${name}`, data);
    const json = await res.json();

    return fromJSON(json, TemplateAsset);
  }

  async deleteWorkspaceAsset(id: Uuid, name: string): Promise<void> {
    await this.invoke('DELETE', `/${id}/workspace/assets/${name}`);
  }

  async getWorkspaceAsset(id: Uuid, name: string): Promise<Blob> {
    const res = await this.invoke('GET', `/${id}/workspace/assets/${name}`);

    return await res.blob();
  }

  async writeWorkspaceApplicableData(id: Uuid, data: string[]) {
    await this.invoke('PUT', `/${id}/workspace/applicable-data`, data);
  }

  async writeWorkspacePreviewJob(id: Uuid, job: Uuid | null) {
    await this.invoke('PUT', `/${id}/workspace/preview-job`, job);
  }

  async writeWorkspaceEducationOptions(id: Uuid, options: EducationOptions | null) {
    await this.invoke('PUT', `/${id}/workspace/render-options/education`, options);
  }

  async writeWorkspaceExperienceOptions(id: Uuid, options: ExperienceOptions | null) {
    await this.invoke('PUT', `/${id}/workspace/render-options/experience`, options);
  }

  async writeWorkspaceSkillOptions(id: Uuid, options: SkillOptions | null): Promise<void> {
    await this.invoke('PUT', `/${id}/workspace/render-options/skill`, options);
  }

  async getWorkspacePreviews(id: Uuid, rebuild?: boolean): Promise<WorkspacePreview | WorkspaceBuildError> {
    const query = rebuild ? '?rebuild=true' : '';
    let res;

    try {
      res = await this.invoke('GET', `/${id}/workspace/previews${query}`);
    } catch (e) {
      if (rebuild && e instanceof ResponseError && e.response.status === 500) {
        return fromJSON(await e.response.json(), WorkspaceBuildError);
      } else {
        throw e;
      }
    }

    return fromJSON(await res.json(), WorkspacePreview);
  }

  async release(id: Uuid, data: ReleaseTemplate): Promise<ULID> {
    const res = await this.invoke('POST', `/${id}/releases`, data);
    const json = await res.json();

    return fromJSON(json, ULID);
  }
}
