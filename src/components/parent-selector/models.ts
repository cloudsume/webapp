import VueI18n, { TranslateResult } from 'vue-i18n';
import { DataProperty, PropertyFlags } from '@/clients/resume-data';
import { DataTable, EditingContext as BaseContext, findParent, GlobalMap } from '@/components/data-editor';
import { getParentLanguage } from '@/i18n';
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

export class EditingContext extends BaseContext<ParentData> {
  globals: GlobalMap;

  constructor(i18n: VueI18n) {
    super();
    this.globals = new GlobalMap();
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
        return this.i18n.t('resume-email-address-data.message.description') as string;
      case 'experience':
        return this.getExperiencePropertyDescription(prop as ExperienceProp) as string;
      case 'github':
        return this.i18n.t('resume-github-username.message.description') as string;
      case 'headline':
        return this.i18n.t('headline-editor.message.value') as string;
      case 'language':
        return this.getLanguagePropertyDescription(prop as LanguageProp) as string;
      case 'linkedin':
        return this.i18n.t('resume-linkedin-username.message.description') as string;
      case 'mobile':
        return this.i18n.t('telephone-editor.message.value-description') as string;
      case 'name':
        return this.getNamePropertyDescription(prop as NameProp) as string;
      case 'photo':
        return null;
      case 'skill':
        return this.getSkillPropertyDescription(prop as SkillProp) as string;
      case 'summary':
        return this.i18n.t('summary-editor.message.description') as string;
      case 'website':
        return this.i18n.t('website-editor.message.description') as string;
    }
  }

  getParentValue(parent: ParentData, selector: (data: object) => DataProperty<unknown>): unknown {
    const m = new DataMerger(parent.value, getParentLanguage(parent.lang), this.globals[parent.type]);
    return m.for(selector);
  }

  private getAddressPropertyDescription(prop: AddressProp): TranslateResult {
    switch (prop) {
      case 'region':
        return this.i18n.t('address-editor.message.region-description');
      case 'street':
        return this.i18n.t('resume-address-address.message.description');
    }
  }

  private getCertificatePropertyDescription(prop: CertificateProp): TranslateResult {
    switch (prop) {
      case 'name':
        return this.i18n.t('parent-selector.message.certificate-name');
      case 'obtained':
        return this.i18n.t('parent-selector.message.certificate-obtained');
    }
  }

  private getEducationPropertyDescription(prop: EducationProp): TranslateResult {
    switch (prop) {
      case 'degree':
        return this.i18n.t('resume-education-degree.message.description');
      case 'description':
        return this.i18n.t('resume-education-description.message.description');
      case 'end':
        return this.i18n.t('resume-education-end.message.description');
      case 'grade':
        return this.i18n.t('resume-education-grade.message.description');
      case 'institute':
        return this.i18n.t('resume-education-campus.message.description');
      case 'region':
        return this.i18n.t('education-editor.message.region-description');
      case 'start':
        return this.i18n.t('resume-education-start.message.description');
    }
  }

  private getExperiencePropertyDescription(prop: ExperienceProp): TranslateResult {
    switch (prop) {
      case 'company':
        return this.i18n.t('resume-experience-company.message.description');
      case 'description':
        return this.i18n.t('resume-experience-description.message.description');
      case 'end':
        return this.i18n.t('experience-editor.message.end-description');
      case 'region':
        return this.i18n.t('experience-editor.message.region-description');
      case 'start':
        return this.i18n.t('resume-experience-start.message.description');
      case 'street':
        return this.i18n.t('resume-experience-address.message.description');
      case 'title':
        return this.i18n.t('resume-experience-title.message.description');
    }
  }

  private getLanguagePropertyDescription(prop: LanguageProp): TranslateResult {
    switch (prop) {
      case 'comment':
        return this.i18n.t('resume-language-comment.message.description');
      case 'language':
        return this.i18n.t('resume-language-language.message.description');
      case 'proficiency':
        return this.i18n.t('resume-language-proficiency.message.description');
    }
  }

  private getNamePropertyDescription(prop: NameProp): TranslateResult {
    switch (prop) {
      case 'first':
        return this.i18n.t('name-editor.message.first-name');
      case 'last':
        return this.i18n.t('name-editor.message.last-name');
      case 'middle':
        return this.i18n.t('name-editor.message.middle-name');
    }
  }

  private getSkillPropertyDescription(prop: SkillProp): TranslateResult {
    switch (prop) {
      case 'name':
        return this.i18n.t('resume-skill-skill.message.description');
      case 'proficiency':
        return this.i18n.t('resume-skill-level.message.description');
    }
  }

  protected readonly i18n: VueI18n;
}

export class ParentData {
  constructor(readonly type: string, readonly lang: string, readonly value: object) {
  }
}

export class DataMerger<Data extends object> extends AbstractMerger<Data> {
  constructor(data: Data, parent: string | null, globals: DataTable | undefined) {
    super();
    this.data = data;
    this.parent = parent;
    this.globals = globals;
  }

  for<T>(selector: (data: Data) => DataProperty<T>): T | null;
  for<T, R>(selector: (data: Data) => DataProperty<T>, result: (value: T | null, lang: string | null) => R): R | null;
  for<T, R>(selector: (data: Data) => DataProperty<T>, result?: (value: T | null, lang: string | null) => R): T | R | null {
    let data: Data | undefined = this.data;
    let parent: string | null = this.parent;
    let lang: string | null = null;

    for (;;) {
      // check if the current layer has value
      let prop = selector(data);

      if (prop.value !== null) {
        return result ? result(prop.value, lang) : prop.value;
      } else if (prop.flags & PropertyFlags.Disabled) {
        return result ? result(null, lang) : null;
      }

      // move to lower layer
      if (parent === null || !this.globals) {
        return null;
      }

      data = findParent(this.globals, data, parent)?.value as Data;

      if (!data) {
        return null;
      }

      lang = parent;
      parent = parent ? getParentLanguage(parent) : null;
    }
  }

  private readonly data: Data;
  private readonly parent: string | null;
  private readonly globals: DataTable | undefined;
}
