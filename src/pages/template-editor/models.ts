import { TranslateResult } from 'vue-i18n';
import { PaymentReceivingMethod } from '@/clients/payment-receiving-method';
import {
  EducationOptions,
  ExperienceOptions,
  MarkdownOptions,
  SkillGrouping,
  SkillOptions,
  TemplateAsset,
  TemplateRegistration
} from '@/clients/template-registration';
import { ModalContext } from '@/components/modal';
import { Uuid } from '@/util/uuid';

export const PageContextKey = Symbol();

export const enum DirtyFlags {
  None = 0x00,
  ApplicableData = 0x01
}

export class RenderOptions {
  education: EducationOptions;
  experience: ExperienceOptions;
  skill: SkillOptions;

  constructor() {
    this.education = new EducationOptions(null, null);
    this.experience = new ExperienceOptions(null, null);
    this.skill = new SkillOptions(SkillGrouping.None);
  }
}

export class PageContext {
  registration: TemplateRegistration | null;
  payments: PaymentReceivingMethod[];
  path: string;
  selected: TemplateAsset | null;
  files: { [name: string]: unknown };
  applicableData: string[];
  previewJob: Uuid | null;
  options: RenderOptions;
  dirty: DirtyFlags;
  busy: boolean;

  constructor() {
    this.registration = null;
    this.payments = [];
    this.path = '';
    this.selected = null;
    this.files = {};
    this.applicableData = [];
    this.previewJob = null;
    this.options = new RenderOptions();
    this.dirty = DirtyFlags.None;
    this.busy = false;
  }

  get main(): string | null {
    const content = this.files['main.stg'];

    if (typeof content === 'string') {
      return content;
    } else {
      return null;
    }
  }

  get size(): number {
    let size = 0;

    for (const name in this.files) {
      const content = this.files[name];

      if (typeof content === 'string') {
        size += new TextEncoder().encode(content).length;
      } else if (content instanceof Blob || content instanceof RemoteContent) {
        size += content.size;
      } else {
        throw new Error(`Don't know how to calculate file size for ${name}.`);
      }
    }

    return size;
  }
}

export class SaveContext extends ModalContext {
  deletes: Set<string>;
  updates: Set<string>;

  constructor(title: string, deletes: Set<string>, updates: Set<string>) {
    super(title);

    this.deletes = deletes;
    this.updates = updates;
  }
}

export class MarkdownContext extends ModalContext {
  constructor(title: TranslateResult, readonly src: MarkdownOptions, readonly save: (result: MarkdownResult) => Promise<boolean>) {
    super(title);
  }
}

export interface MarkdownResult {
  paragraph?: string;
  listOptions?: string;
}

export class RemoteContent {
  size: number;

  constructor(size: number) {
    this.size = size;
  }
}
