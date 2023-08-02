import VueI18n from 'vue-i18n';
import { Resume as ServerModel, ResumeLink } from '@/clients/resume';
import { ResumeData } from '@/clients/resume-data';
import { Template as ApiTemplate } from '@/clients/template';
import { RegistrationCategory, TemplateLicense, TemplateRegistration } from '@/clients/template-registration';
import { DataState, findParent, PropertyType } from '@/components/data-editor';
import { ModalContext } from '@/components/modal';
import { EditingContext } from '@/components/parent-selector';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';

export class Context extends EditingContext {
  remotePositions: Map<DataState, number>;

  constructor(i18n: VueI18n) {
    super(i18n);
    this.remotePositions = new Map();
  }

  /**
   * Find parent of the specified data.
   *
   * @param data The data to find its parent.
   * @param lang The parent language of the data.
   *
   * @returns The parent data if there is one; otherwise null.
   */
  parent(data: ResumeData, lang: string): ResumeData | null {
    return findParent(this.globals, data, lang);
  }
}

export class Resume {
  id: string;
  name: string;
  template: ULID;
  thumbnails: string[];
  data: DataEntry[];
  links: ResumeLink[];
  recruitmentConsent: boolean;
  deletes: DataEntry[];
  createdAt: Date;

  constructor(dto: ServerModel, thumbnails: string[], data: DataEntry[]) {
    this.id = dto.id;
    this.name = dto.name;
    this.template = new ULID(dto.template);
    this.thumbnails = thumbnails;
    this.data = data;
    this.links = dto.links;
    this.recruitmentConsent = dto.recruitmentConsent;
    this.deletes = [];
    this.createdAt = dto.createdAt;
  }

  dispose(): void {
    for (const url of this.thumbnails) {
      URL.revokeObjectURL(url);
    }
  }

  iterateData<R>(action: (e: DataEntry, i: number) => R): R | undefined {
    let i = 0, prev;

    for (const e of this.data) {
      if (e.type !== prev) {
        i = 0;
      }

      const r = action(e, i);

      if (r !== undefined) {
        return r;
      }

      prev = e.type;
      i++;
    }

    return undefined;
  }

  updateThumbnails(urls: string[]): void {
    for (const url of this.thumbnails) {
      URL.revokeObjectURL(url);
    }

    this.thumbnails = urls;
  }
}

export class Template {
  readonly id: ULID;
  readonly regId: Uuid;
  readonly user: Uuid;
  readonly name: string;
  readonly language: string;
  readonly category: RegistrationCategory;
  readonly license: TemplateLicense | null;

  constructor(id: ULID, regId: Uuid, user: Uuid, name: string, language: string, category: RegistrationCategory, license: TemplateLicense | null);
  constructor(dto: ApiTemplate, reg: TemplateRegistration, license: TemplateLicense | null);
  constructor(...args: any[]) {
    if (args[0] instanceof ULID) {
      this.id = args[0];
      this.regId = args[1];
      this.user = args[2];
      this.name = args[3];
      this.language = args[4];
      this.category = args[5];
      this.license = args[6];
    } else {
      const t = args[0] as ApiTemplate;
      const r = args[1] as TemplateRegistration;
      const l = args[2] as TemplateLicense | null;

      this.id = t.id;
      this.regId = r.id;
      this.user = r.userId;
      this.name = r.name;
      this.language = r.language;
      this.category = t.category;
      this.license = l;
    }
  }
}

export class DataEntry {
  readonly id: number;
  readonly type: string;
  state: DataState | null;

  constructor(id: number, type: string, state?: DataState) {
    this.id = id;
    this.type = type;
    this.state = state ?? null;
  }
}

export class GlobalModalContext extends ModalContext {
  readonly resume: string;
  readonly lang: string;
  readonly type: string;
  readonly trigger: DataState;

  constructor(resume: string, lang: string, type: string, trigger: DataState) {
    super();

    this.resume = resume;
    this.lang = lang;
    this.type = type;
    this.trigger = trigger;
  }
}

export class ImportSource {
  constructor(readonly source: FromResume | FromGlobal, readonly data: object) {
  }
}

export class FromResume {
  constructor(readonly id: Uuid, readonly index: number | null) {
  }
}

export class FromGlobal {
  constructor(readonly lang: string, readonly id: Uuid | null) {
  }
}

export class ImportField {
  readonly name: string | null;
  readonly type: PropertyType;
  readonly value: unknown;
  selected: boolean;

  constructor(name: string | null, type: PropertyType, value: unknown) {
    if (value === null) {
      throw new Error('The value cannot be null.');
    }

    this.name = name;
    this.type = type;
    this.value = value;
    this.selected = false;
  }
}
