import { Constructor, GenericClass, InvalidProperty, JsonClass, JsonProperty, MappingContext, PolymorphismObject } from '@ultimicro/json-mapper';
import { PaymentProvider } from '@/clients/payment';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';

export const enum RegistrationCategory {
  Free = 0,
  Private = 1,
  Paid = 2
}

@JsonClass()
export class RegisterTemplate {
  @JsonProperty()
  name: string;

  @JsonProperty({ type: String })
  description: string | null;

  @JsonProperty({ type: String })
  website: string | null;

  @JsonProperty()
  culture: string;

  @JsonProperty({ args: [Uuid] })
  applicableJobs: Uuid[];

  @JsonProperty({ type: Uuid })
  previewJob: Uuid | null;

  @JsonProperty()
  category: RegistrationCategory;

  constructor(
    name: string,
    description: string | null,
    website: string | null,
    culture: string,
    applicableJobs: Uuid[],
    previewJob: Uuid | null,
    category: RegistrationCategory) {
    this.name = name;
    this.description = description;
    this.website = website;
    this.culture = culture;
    this.applicableJobs = applicableJobs;
    this.previewJob = previewJob;
    this.category = category;
  }
}

@JsonClass()
export class TemplateRegistration {
  @JsonProperty()
  id: Uuid;

  @JsonProperty()
  userId: Uuid;

  @JsonProperty()
  name: string;

  @JsonProperty()
  description: string;

  @JsonProperty({ type: String })
  website: string | null;

  @JsonProperty()
  language: string;

  @JsonProperty({ args: [Uuid] })
  applicableJobs: Uuid[];

  @JsonProperty()
  category: RegistrationCategory;

  @JsonProperty({ args: [String, Number] })
  prices: Map<string, number>;

  @JsonProperty({ type: ULID })
  latestRelease: ULID | null;

  @JsonProperty()
  resumeCount: number;

  @JsonProperty()
  createdAt: Date;

  @JsonProperty()
  updatedAt: Date;

  constructor(
    id: Uuid,
    userId: Uuid,
    name: string,
    description: string,
    website: string | null,
    language: string,
    applicableJobs: Uuid[],
    category: RegistrationCategory,
    prices: Map<string, number>,
    latestRelease: ULID | null,
    resumeCount: number,
    createdAt: Date,
    updatedAt: Date) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.description = description;
    this.website = website;
    this.language = language;
    this.applicableJobs = applicableJobs;
    this.category = category;
    this.prices = prices;
    this.latestRelease = latestRelease;
    this.resumeCount = resumeCount;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export const enum TemplateLicenseStatus {
  Valid = 0
}

@JsonClass()
export class TemplateLicense {
  @JsonProperty()
  id: ULID;

  @JsonProperty()
  registrationId: Uuid;

  @JsonProperty()
  userId: Uuid;

  @JsonProperty()
  status: TemplateLicenseStatus;

  @JsonProperty({ type: Date })
  updatedAt: Date | null;

  constructor(id: ULID, registrationId: Uuid, userId: Uuid, status: TemplateLicenseStatus, updatedAt: Date | null) {
    this.id = id;
    this.registrationId = registrationId;
    this.userId = userId;
    this.status = status;
    this.updatedAt = updatedAt;
  }
}

@JsonClass()
export class PaymentMethod implements PolymorphismObject {
  @JsonProperty({ movable: false })
  provider: PaymentProvider;

  @JsonProperty()
  amount: number;

  constructor(provider: PaymentProvider, amount: number) {
    this.provider = provider;
    this.amount = amount;
  }

  getType(ctx: MappingContext): Constructor | GenericClass {
    switch (this.provider) {
      case PaymentProvider.Stripe:
        return StripePayment;
      default:
        throw new InvalidProperty(`Unknown provider ${this.provider}.`, ctx.pathFor('provider'));
    }
  }
}

@JsonClass()
export class StripePayment extends PaymentMethod {
  @JsonProperty()
  clientSecret: string;

  constructor(amount: number, clientSecret: string) {
    super(PaymentProvider.Stripe, amount);
    this.clientSecret = clientSecret;
  }
}

export const enum CancelPurchaseReason {
  TooExpensive = 0,
  NoCard = 1,
  Untrusted = 2,
  MistakenFree = 3,
  PaymentNotWorking = 4
}

@JsonClass()
export class MarkdownOptions {
  @JsonProperty({ type: String })
  descriptionParagraph: string | null;

  @JsonProperty({ type: String })
  descriptionListOptions: string | null;

  constructor(descriptionParagraph: string | null, descriptionListOptions: string | null) {
    this.descriptionParagraph = descriptionParagraph;
    this.descriptionListOptions = descriptionListOptions;
  }
}

@JsonClass()
export class EducationOptions extends MarkdownOptions {
}

@JsonClass()
export class ExperienceOptions extends MarkdownOptions {
}

export const enum SkillGrouping {
  None = 0,
  Level = 1
}

@JsonClass()
export class SkillOptions {
  @JsonProperty()
  grouping: SkillGrouping;

  constructor(grouping: SkillGrouping) {
    this.grouping = grouping;
  }
}

@JsonClass()
export class RenderOptions {
  @JsonProperty({ optional: true })
  education?: EducationOptions;

  @JsonProperty({ optional: true })
  experience?: ExperienceOptions;

  @JsonProperty({ optional: true })
  skill?: SkillOptions;
}

@JsonClass()
export class TemplateAsset {
  @JsonProperty()
  name: string;

  @JsonProperty()
  size: number;

  @JsonProperty()
  lastModified: Date;

  constructor(name: string, size: number, lastModified: Date) {
    this.name = name;
    this.size = size;
    this.lastModified = lastModified;
  }
}

@JsonClass()
export class TemplateWorkspace {
  @JsonProperty({ args: [String] })
  applicableData: string[];

  @JsonProperty({ type: Uuid })
  previewJob: Uuid | null;

  @JsonProperty()
  renderOptions: RenderOptions;

  @JsonProperty({ args: [TemplateAsset] })
  assets: TemplateAsset[];

  constructor(applicableData: string[], previewJob: Uuid | null, renderOptions: RenderOptions, assets: TemplateAsset[]) {
    this.applicableData = applicableData;
    this.previewJob = previewJob;
    this.renderOptions = renderOptions;
    this.assets = assets;
  }
}

@JsonClass()
export class WorkspacePreview {
  @JsonProperty({ optional: true })
  source?: string;

  @JsonProperty({ args: [String] })
  thumbnails: string[];

  constructor(source: string | undefined, thumbnails: string[]) {
    this.source = source;
    this.thumbnails = thumbnails;
  }
}

@JsonClass()
export class WorkspaceBuildError {
  @JsonProperty({ type: String })
  source: string | null;

  @JsonProperty()
  log: string;

  @JsonProperty({ type: Number })
  line: number | null;

  constructor(source: string | null, log: string, line: number | null) {
    this.source = source;
    this.log = log;
    this.line = line;
  }
}

@JsonClass()
export class ReleaseTemplate {
  @JsonProperty()
  note: string;

  constructor(note: string) {
    this.note = note;
  }
}

@JsonClass()
export class TemplateInfo {
  @JsonProperty()
  id: ULID;

  @JsonProperty()
  registrationId: Uuid;

  @JsonProperty()
  category: RegistrationCategory;

  @JsonProperty({ args: [String] })
  applicableData: string[];

  @JsonProperty()
  releaseNote: string;

  constructor(id: ULID, registrationId: Uuid, category: RegistrationCategory, applicableData: string[], releaseNote: string) {
    this.id = id;
    this.registrationId = registrationId;
    this.category = category;
    this.applicableData = applicableData;
    this.releaseNote = releaseNote;
  }
}

@JsonClass()
export class TemplateSummary extends TemplateInfo {
  @JsonProperty()
  preview: string;

  constructor(id: ULID, registrationId: Uuid, category: RegistrationCategory, applicableData: string[], releaseNote: string, preview: string) {
    super(id, registrationId, category, applicableData, releaseNote);
    this.preview = preview;
  }
}
