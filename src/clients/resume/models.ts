import { JsonClass, JsonProperty } from '@ultimicro/json-mapper';
import { ResumeData } from '@/clients/resume-data';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';

@JsonClass()
export class CreateResume {
  @JsonProperty()
  name: string;

  @JsonProperty({ type: ULID })
  template: ULID | null;

  @JsonProperty({ type: Uuid })
  copyFrom: Uuid | null;

  constructor(name: string, template: ULID | null, copyFrom: Uuid | null) {
    this.name = name;
    this.template = template;
    this.copyFrom = copyFrom;
  }
}

@JsonClass()
export class CreateResumeLink {
  @JsonProperty()
  name: string;

  @JsonProperty({ args: [String] })
  censorships: string[];

  constructor(name: string, censorships: string[]) {
    this.name = name;
    this.censorships = censorships;
  }
}

@JsonClass()
export class ResumeLink {
  @JsonProperty()
  id: string;

  @JsonProperty()
  name: string;

  @JsonProperty({ args: [String] })
  censorships: string[];

  @JsonProperty({ type: Date })
  accessedAt: Date | null;

  @JsonProperty()
  createdAt: Date;

  constructor(id: string, name: string, censorships: string[], accessedAt: Date | null, createdAt: Date) {
    this.id = id;
    this.name = name;
    this.censorships = censorships;
    this.accessedAt = accessedAt;
    this.createdAt = createdAt;
  }
}

@JsonClass()
export class ResumeInfo {
  @JsonProperty()
  id: string;

  @JsonProperty()
  name: string;

  @JsonProperty()
  template: string;

  @JsonProperty({ args: [ResumeLink] })
  links: ResumeLink[];

  @JsonProperty()
  recruitmentConsent: boolean;

  @JsonProperty()
  createdAt: Date;

  constructor(id: string, name: string, template: string, links: ResumeLink[], recruitmentConsent: boolean, createdAt: Date) {
    this.id = id;
    this.name = name;
    this.template = template;
    this.links = links;
    this.recruitmentConsent = recruitmentConsent;
    this.createdAt = createdAt;
  }
}

@JsonClass()
export class Resume extends ResumeInfo {
  @JsonProperty()
  culture: string;

  @JsonProperty({ args: [String] })
  thumbnails: string[];

  @JsonProperty({ args: [ResumeData] })
  data: ResumeData[];

  constructor(
    id: string,
    name: string,
    template: string,
    links: ResumeLink[],
    recruitmentConsent: boolean,
    createdAt: Date,
    culture: string,
    thumbnails: string[],
    data: ResumeData[]) {
    super(id, name, template, links, recruitmentConsent, createdAt);
    this.culture = culture;
    this.thumbnails = thumbnails;
    this.data = data;
  }
}

@JsonClass()
export class ResumeSummary extends ResumeInfo {
  @JsonProperty()
  image: string;

  constructor(id: string, name: string, template: string, links: ResumeLink[], recruitmentConsent: boolean, createdAt: Date, image: string) {
    super(id, name, template, links, recruitmentConsent, createdAt);
    this.image = image;
  }
}

@JsonClass()
export class DataUpdateResult {
  @JsonProperty({ args: [String] })
  thumbnails: string[];

  @JsonProperty({ args: [ResumeData] })
  data: ResumeData[];

  constructor(thumbnails: string[], data: ResumeData[]) {
    this.thumbnails = thumbnails;
    this.data = data;
  }
}

@JsonClass()
export class LinkAccess {
  @JsonProperty()
  id: ULID;

  constructor(id: ULID) {
    this.id = id;
  }
}
