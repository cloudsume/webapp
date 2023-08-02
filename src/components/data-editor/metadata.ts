import { IVueI18n, TranslateResult } from 'vue-i18n';
import { ResumeAddress, ResumeCertificate, ResumeEducation, ResumeExperience, ResumeLanguage, ResumeName, ResumeSkill } from '@/clients/resume-data';

export function getDataMetadata(type: string): DataMetadata {
  const m = table[type];

  if (!m) {
    throw new Error(`Unknow data '${type}'.`);
  }

  return m;
}

export function getPropertyMetadata(type: string, prop: string): PropertyMetadata {
  const m = props.get(`${type}-${prop}`);

  if (!m) {
    throw new Error(`No metata for property '${prop}' on data '${type}'.`);
  }

  return m;
}

export function getPropertyLabel(i18n: IVueI18n, type: string, prop: string): TranslateResult {
  return getPropertyMetadata(type, prop).label(i18n);
}

export const enum PropertyType {
  DateMonth = 'datemonth',
  Division = 'division',
  Image = 'image',
  Language = 'language',
  LanguageProficiency = 'language-proficiency',
  Multiline = 'multiline',
  Singleline = 'singleline',
  SkillLevel = 'skill-level',
  Telephone = 'telephone'
}

export interface PropertyMetadata {
  name: string;
  key: string,
  type: PropertyType;
  label: (i18n: IVueI18n) => TranslateResult;
}

export interface CreateArg {
  name: string;
  value: unknown;
}

export interface DataMetadata {
  label(i18n: IVueI18n, index?: number): TranslateResult;
  type?: PropertyType;
  key?: string;
  props?: PropertyMetadata[];
  create?: (args: CreateArg[]) => object;
}

const table: MetadataTable = {
  name: {
    label: i => i.t('resume-name-data.label.header'),
    props: [
      {
        name: 'firstName',
        key: 'first',
        type: PropertyType.Singleline,
        label: i => i.t('data-editor.label.name-first-name')
      },
      {
        name: 'middleName',
        key: 'middle',
        type: PropertyType.Singleline,
        label: i => i.t('data-editor.label.name-middle-name')
      },
      {
        name: 'lastName',
        key: 'last',
        type: PropertyType.Singleline,
        label: i => i.t('data-editor.label.name-last-name')
      }
    ],
    create: factory(ResumeName, 'firstName', 'middleName', 'lastName')
  },
  headline: {
    label: i => i.t('resume-headline-data.label.header'),
    type: PropertyType.Singleline,
    key: 'headline'
  },
  address: {
    label: i => i.t('resume-address-data.label.header'),
    props: [
      {
        name: 'region',
        key: 'region',
        type: PropertyType.Division,
        label: i => i.t('data-editor.label.address-region')
      },
      {
        name: 'street',
        key: 'street',
        type: PropertyType.Singleline,
        label: i => i.t('resume-address-address.label.header')
      }
    ],
    create: factory(ResumeAddress, 'region', 'street')
  },
  mobile: {
    label: i => i.t('resume-mobile-number-data.label.header'),
    type: PropertyType.Telephone,
    key: 'number'
  },
  email: {
    label: i => i.t('resume-email-address-data.label.header'),
    type: PropertyType.Singleline,
    key: 'address'
  },
  linkedin: {
    label: i => i.t('resume-linkedin-data.label.header'),
    type: PropertyType.Singleline,
    key: 'username'
  },
  github: {
    label: i => i.t('resume-github-data.label.header'),
    type: PropertyType.Singleline,
    key: 'username'
  },
  website: {
    label: i => i.t('data-editor.label.website'),
    type: PropertyType.Singleline,
    key: 'url'
  },
  photo: {
    label: i => i.t('resume-photo-data.label.header'),
    type: PropertyType.Image,
    key: 'photo'
  },
  summary: {
    label: i => i.t('resume-summary-data.label.header'),
    type: PropertyType.Multiline,
    key: 'summary'
  },
  experience: {
    label: function (i, n) {
      if (n === undefined) {
        return i.t('data-editor.label.experience');
      } else {
        return i.t('resume-experience-data.label.header', { index: n });
      }
    },
    props: [
      {
        name: 'start',
        key: 'start',
        type: PropertyType.DateMonth,
        label: i => i.t('resume-experience-start.label.header')
      },
      {
        name: 'end',
        key: 'end',
        type: PropertyType.DateMonth,
        label: i => i.t('resume-experience-end.label.header')
      },
      {
        name: 'title',
        key: 'title',
        type: PropertyType.Singleline,
        label: i => i.t('resume-experience-title.label.header')
      },
      {
        name: 'company',
        key: 'company',
        type: PropertyType.Singleline,
        label: i => i.t('resume-experience-company.label.header')
      },
      {
        name: 'region',
        key: 'region',
        type: PropertyType.Division,
        label: i => i.t('data-editor.label.experience-location')
      },
      {
        name: 'street',
        key: 'street',
        type: PropertyType.Singleline,
        label: i => i.t('resume-experience-address.label.header')
      },
      {
        name: 'description',
        key: 'description',
        type: PropertyType.Multiline,
        label: i => i.t('resume-experience-description.label.header')
      }
    ],
    create: factory(ResumeExperience, 'id', 'base', 'start', 'end', 'title', 'company', 'region', 'street', 'description')
  },
  education: {
    label: function (i, n) {
      if (n === undefined) {
        return i.t('data-editor.label.education');
      } else {
        return i.t('resume-education-data.label.header', { index: n });
      }
    },
    props: [
      {
        name: 'institute',
        key: 'institute',
        type: PropertyType.Singleline,
        label: i => i.t('resume-education-campus.label.header')
      },
      {
        name: 'region',
        key: 'region',
        type: PropertyType.Division,
        label: i => i.t('data-editor.label.education-region')
      },
      {
        name: 'degreeName',
        key: 'degree',
        type: PropertyType.Singleline,
        label: i => i.t('resume-education-degree.label.header')
      },
      {
        name: 'start',
        key: 'start',
        type: PropertyType.DateMonth,
        label: i => i.t('resume-education-start.label.header')
      },
      {
        name: 'end',
        key: 'end',
        type: PropertyType.DateMonth,
        label: i => i.t('resume-education-end.label.header')
      },
      {
        name: 'grade',
        key: 'grade',
        type: PropertyType.Singleline,
        label: i => i.t('resume-education-grade.label.header')
      },
      {
        name: 'description',
        key: 'description',
        type: PropertyType.Multiline,
        label: i => i.t('resume-education-description.label.header')
      }
    ],
    create: factory(ResumeEducation, 'id', 'base', 'institute', 'region', 'degreeName', 'start', 'end', 'grade', 'description')
  },
  certificate: {
    label: function (i, n) {
      if (n === undefined) {
        return i.t('data-editor.label.certificate');
      } else {
        return i.t('data-editor.label.certificate-ordered', { index: n });
      }
    },
    props: [
      {
        name: 'name',
        key: 'name',
        type: PropertyType.Singleline,
        label: i => i.t('data-editor.label.certificate-name')
      },
      {
        name: 'obtained',
        key: 'obtained',
        type: PropertyType.DateMonth,
        label: i => i.t('data-editor.label.certificate-obtained')
      }
    ],
    create: factory(ResumeCertificate, 'id', 'base', 'name', 'obtained')
  },
  skill: {
    label: function (i, n) {
      if (n === undefined) {
        return i.t('data-editor.label.skill');
      } else {
        return i.t('resume-skill-data.label.header', { index: n });
      }
    },
    props: [
      {
        name: 'name',
        key: 'name',
        type: PropertyType.Singleline,
        label: i => i.t('resume-skill-skill.label.header')
      },
      {
        name: 'level',
        key: 'proficiency',
        type: PropertyType.SkillLevel,
        label: i => i.t('resume-skill-level.label.header')
      }
    ],
    create: factory(ResumeSkill, 'id', 'base', 'name', 'level')
  },
  language: {
    label: function (i, n) {
      if (n === undefined) {
        return i.t('data-editor.label.language');
      } else {
        return i.t('resume-language-data.label.header', { index: n });
      }
    },
    props: [
      {
        name: 'tag',
        key: 'language',
        type: PropertyType.Language,
        label: i => i.t('resume-language-language.label.header')
      },
      {
        name: 'proficiency',
        key: 'proficiency',
        type: PropertyType.LanguageProficiency,
        label: i => i.t('resume-language-proficiency.label.header')
      },
      {
        name: 'comment',
        key: 'comment',
        type: PropertyType.Singleline,
        label: i => i.t('resume-language-comment.label.header')
      }
    ],
    create: factory(ResumeLanguage, 'id', 'base', 'tag', 'proficiency', 'comment')
  }
};

const props = new Map<string, PropertyMetadata>();

for (const [type, meta] of Object.entries(table)) {
  if (meta.props) {
    for (const prop of meta.props) {
      props.set(`${type}-${prop.name}`, prop);
    }
  }
}

function factory<T>(ctor: new (...args: any[]) => T, ...params: Array<keyof T>) {
  return (args: CreateArg[]): T => {
    const values = new Array<any>();

    for (const param of params) {
      const arg = args.find(a => a.name === param);

      if (!arg) {
        throw new Error(`No argument '${String(param)}' has been supplied.`);
      }

      values.push(arg.value);
    }

    return new ctor(...values);
  };
}

interface MetadataTable {
  [type: string]: DataMetadata;
}
