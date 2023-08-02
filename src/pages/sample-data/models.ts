import VueI18n, { TranslateResult } from 'vue-i18n';
import { DataProperty, MultiplicableData, PropertyFlags } from '@/clients/resume-data';
import { DataState, EditingContext, maxEntries } from '@/components/data-editor';
import { getParentLanguage } from '@/i18n';
import { SampleData } from '@/rest-endpoints/sample-data';
import {
  AddressProp,
  CertificateProp,
  DataMerger as AbstractMerger,
  DataType,
  EducationProp,
  ExperienceProp,
  LanguageProp,
  NameProp,
  SkillProp
} from '@/resume-data';
import { Uuid } from '@/util/uuid';

export class Context extends EditingContext<SampleData> {
  data: DataSet;
  job: Uuid | null;
  locale: string | null;
  item: number | null; // item ID

  constructor(i18n: VueI18n) {
    super();
    this.data = new DataSet([]);
    this.job = null;
    this.locale = null;
    this.item = null;
    this.i18n = i18n;
  }

  getDescription(type: DataType, prop?: string): string | null {
    switch (type) {
      case 'address':
        return this.getAddressPropertyDescription(prop as AddressProp) as string;
      case 'certificate':
        return this.getCertificatePropertyDescription(prop as CertificateProp) as string;
      case 'education':
        return this.getEducationPropertyDescription(prop as EducationProp) as string;
      case 'email':
        return this.i18n.t('sample-data.message.email') as string;
      case 'experience':
        return this.getExperiencePropertyDescription(prop as ExperienceProp) as string;
      case 'github':
        return this.i18n.t('sample-data.message.github') as string;
      case 'headline':
        return this.i18n.t('sample-data.message.headline') as string;
      case 'language':
        return this.getLanguagePropertyDescription(prop as LanguageProp) as string;
      case 'linkedin':
        return this.i18n.t('sample-data.message.linkedin') as string;
      case 'mobile':
        return this.i18n.t('sample-data.message.mobile') as string;
      case 'name':
        return this.getNamePropertyDescription(prop as NameProp) as string;
      case 'photo':
        return this.i18n.t('sample-data.message.photo') as string;
      case 'skill':
        return this.getSkillPropertyDescription(prop as SkillProp) as string;
      case 'summary':
        return this.i18n.t('sample-data.message.summary') as string;
      case 'website':
        return this.i18n.t('sample-data.message.website') as string;
    }
  }

  getParentValue(parent: SampleData, selector: (data: object) => DataProperty<unknown>): unknown {
    const m = new DataMerger(parent, this.data);
    return m.for(selector);
  }

  private getAddressPropertyDescription(prop: AddressProp): TranslateResult {
    switch (prop) {
      case 'region':
        return this.i18n.t('sample-data.message.address-region');
      case 'street':
        return this.i18n.t('sample-data.message.address-street');
    }
  }

  private getCertificatePropertyDescription(prop: CertificateProp): TranslateResult {
    switch (prop) {
      case 'name':
        return this.i18n.t('sample-data.message.certificate-name');
      case 'obtained':
        return this.i18n.t('sample-data.message.certificate-obtained');
    }
  }

  private getEducationPropertyDescription(prop: EducationProp): TranslateResult {
    switch (prop) {
      case 'degree':
        return this.i18n.t('sample-data.message.education-degree');
      case 'description':
        return this.i18n.t('sample-data.message.education-description');
      case 'end':
        return this.i18n.t('sample-data.message.education-end');
      case 'grade':
        return this.i18n.t('sample-data.message.education-grade');
      case 'institute':
        return this.i18n.t('sample-data.message.education-institute');
      case 'region':
        return this.i18n.t('sample-data.message.education-region');
      case 'start':
        return this.i18n.t('sample-data.message.education-start');
    }
  }

  private getExperiencePropertyDescription(prop: ExperienceProp): TranslateResult {
    switch (prop) {
      case 'company':
        return this.i18n.t('sample-data.message.experience-company');
      case 'description':
        return this.i18n.t('sample-data.message.experience-description');
      case 'end':
        return this.i18n.t('sample-data.message.experience-end');
      case 'region':
        return this.i18n.t('sample-data.message.experience-region');
      case 'start':
        return this.i18n.t('sample-data.message.experience-start');
      case 'street':
        return this.i18n.t('sample-data.message.experience-street');
      case 'title':
        return this.i18n.t('sample-data.message.experience-title');
    }
  }

  private getLanguagePropertyDescription(prop: LanguageProp): TranslateResult {
    switch (prop) {
      case 'comment':
        return this.i18n.t('sample-data.message.language-comment');
      case 'language':
        return this.i18n.t('sample-data.message.language-language');
      case 'proficiency':
        return this.i18n.t('sample-data.message.language-proficiency');
    }
  }

  private getNamePropertyDescription(prop: NameProp): TranslateResult {
    switch (prop) {
      case 'first':
        return this.i18n.t('sample-data.message.name-first');
      case 'last':
        return this.i18n.t('sample-data.message.name-last');
      case 'middle':
        return this.i18n.t('sample-data.message.name-middle');
    }
  }

  private getSkillPropertyDescription(prop: SkillProp): TranslateResult {
    switch (prop) {
      case 'name':
        return this.i18n.t('sample-data.message.skill-name');
      case 'proficiency':
        return this.i18n.t('sample-data.message.skill-proficiency');
    }
  }

  private readonly i18n: VueI18n;
}

export class DataMerger<Data extends object> extends AbstractMerger<Data> {
  constructor(data: SampleData, set: DataSet) {
    super();
    this.data = data;
    this.set = set;
  }

  for<T>(selector: (data: Data) => DataProperty<T>): T | null {
    let data = this.data;
    let job = data.targetJob;
    let locale: string | null = data.locale;

    for (;;) {
      // check if the current layer has value
      const value = data.data.value as Data;
      const prop = selector(value);

      if (prop.value !== null) {
        return prop.value;
      } else if (prop.flags & PropertyFlags.Disabled) {
        return null;
      }

      // get target parent
      if (data.parentJob) {
        job = data.parentJob;
      } else {
        locale = getParentLanguage(locale);

        if (locale === null) {
          return null;
        }
      }

      // load parent data
      const next = this.set.get(job, locale, data.data.type as DataType);

      if (!next) {
        return null;
      } else if (Array.isArray(next)) {
        const base = (value as MultiplicableData).base;

        if (!base) {
          return null;
        }

        const parent = next.find(i => base.equals((i.data.value as MultiplicableData).id));

        if (!parent) {
          return null;
        }

        data = parent;
      } else {
        data = next;
      }
    }
  }

  private readonly data: SampleData;
  private readonly set: DataSet;
}

export class DataSet {
  constructor(samples: SampleData[]) {
    this.data = new Map();

    for (const sample of samples) {
      const key = DataSet.getKey(sample);
      const data = this.data.get(key);

      if (data) {
        if (!Array.isArray(data)) {
          throw new Error(`Expected array for data '${sample.data.type}'.`);
        }

        data.push(sample);
      } else if (maxEntries(sample.data.type) > 1) {
        this.data.set(key, [sample]);
      } else {
        this.data.set(key, sample);
      }
    }
  }

  static getKey(data: SampleData): string {
    const job = data.targetJob;
    const locale = data.locale;
    const type = data.data.type as DataType;

    return this.makeKey(job, locale, type);
  }

  static makeKey(job: Uuid, locale: string, type: DataType): string {
    return `${job}-${locale}-${type}`;
  }

  [Symbol.iterator](): IterableIterator<SampleData | SampleData[]> {
    return this.data.values();
  }

  get(key: string): SampleData | SampleData[] | undefined;
  get(job: Uuid, locale: string, type: DataType): SampleData | SampleData[] | undefined;
  get(...args: [string] | [Uuid, string, DataType]): SampleData | SampleData[] | undefined {
    let key: string;

    if (args.length === 1) {
      key = args[0];
    } else {
      key = DataSet.makeKey(args[0], args[1], args[2]);
    }

    return this.data.get(key);
  }

  set(key: string, value: SampleData | SampleData[]) {
    this.data.set(key, value);
  }

  private readonly data: Map<string, SampleData | SampleData[]>;
}

export class Item {
  id: number;
  type: string;
  data: ItemData | null;

  constructor(type: string, data: ItemData | null) {
    this.id = Item.nextID++;
    this.type = type;
    this.data = data;
  }

  private static nextID = 1;
}

export class ItemData {
  state: DataState;
  remotePosition: number | null; // index within the group of the same type
  remoteParent: number | null; // index into parents array
  parents: SampleData[];

  constructor(state: DataState, remotePosition: number | null, remoteParent: number | null, parents: SampleData[]) {
    this.state = state;
    this.remotePosition = remotePosition;
    this.remoteParent = remoteParent;
    this.parents = parents;
  }

  hasChanges(currentIndex: number): boolean {
    const s = this.state;

    // check for data changes
    if (!s.remote || s.dirty || this.remotePosition !== currentIndex) {
      return true;
    }

    // check for parent change
    const parent = s.parent as SampleData | null;
    const remoteParent = this.remoteParent;

    if (parent) {
      if (remoteParent !== this.parents.indexOf(parent)) {
        return true;
      }
    } else if (remoteParent !== null) {
      return true;
    }

    return false;
  }
}
