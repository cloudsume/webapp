import { IVueI18n } from 'vue-i18n';
import { TelephoneNumber } from '@/clients/rest';
import {
  DataProperty,
  IELTS,
  IELTSType,
  ILR,
  LanguageProficiency,
  LanguageProficiencyType,
  ResumeAddress,
  ResumeCertificate,
  ResumeEducation,
  ResumeExperience,
  ResumeLanguage,
  ResumeName,
  ResumeSkill
} from '@/clients/resume-data';
import { getSkillLevelLabel } from '@/components/data-editor';
import { getCountryCode, getCountryName, getLanguageName, getLanguageRegion, getSubdivisionName } from '@/i18n';
import { DataMerger } from './merger';

export function formatAddress(m: DataMerger<ResumeAddress>, l: string): string {
  let street, region;

  if ((street = m.for(d => d.street)) !== null) {
    return street;
  } else if ((region = m.for(d => d.region)) !== null) {
    const country = getCountryCode(region);

    return `${getSubdivisionName(region, l)}, ${getCountryName(country, l)}`;
  } else {
    return '';
  }
}

export function formatCertificate(m: DataMerger<ResumeCertificate>): string {
  return `${m.for(d => d.name)}`;
}

export function formatEducation(m: DataMerger<ResumeEducation>): string {
  return `${m.for(d => d.institute)} | ${m.for(d => d.degreeName)}`;
}

export function formatExperience(m: DataMerger<ResumeExperience>): string {
  return `${m.for(d => d.company)} | ${m.for(d => d.title)}`;
}

export function formatLanguage(m: DataMerger<ResumeLanguage>, l: string, i: IVueI18n): string {
  const tag = m.for(d => d.tag);
  const proficiency = m.for(d => d.proficiency);

  return `${tag ? getLanguageName(tag, l) : ''} | ${proficiency ? formatLanguageProficiency(i, proficiency) : ''}`;
}

export function formatLanguageProficiency(i18n: IVueI18n, value: LanguageProficiency) {
  switch (value.type) {
    case LanguageProficiencyType.ILR:
      return formatILR(i18n, value.value as ILR);
    case LanguageProficiencyType.TOEIC:
      return i18n.t('language-editor.label.toeic-display', { score: value.value }) as string;
    case LanguageProficiencyType.IELTS:
      return formatIELTS(i18n, value.value as IELTS);
    case LanguageProficiencyType.TOEFL:
      return i18n.t('language-editor.label.toefl-display', { score: value.value }) as string;
    default:
      throw new Error(`Unknow proficiency type '${value.type}'.`);
  }
}

export function formatName(m: DataMerger<ResumeName>, l: string): string {
  switch (getLanguageRegion(l)) {
    case 'US':
    case 'TH':
      return [m.for(d => d.firstName), m.for(d => d.middleName), m.for(d => d.lastName)].filter(p => p !== null).join(' ');
    default:
      throw new Error(`Don't know how to format name in locale '${l}'.`);
  }
}

export function formatSkill(m: DataMerger<ResumeSkill>, i: IVueI18n): string {
  const name = m.for(d => d.name);
  const level = m.for(d => d.level);

  if (level === null) {
    return `${name}`;
  } else {
    return `${name} | ${getSkillLevelLabel(i, level)}`;
  }
}

export function formatString(m: DataMerger<DataProperty<string>>): string {
  return m.for(d => d) ?? '';
}

export function formatTelephone(m: DataMerger<DataProperty<TelephoneNumber>>, l: string): string {
  const n = m.for(d => d);

  if (n === null) {
    return '';
  } else {
    return `${getCountryName(n.country, l)} | ${n.number}`;
  }
}

function formatILR(i18n: IVueI18n, value: ILR): string {
  switch (value) {
    case ILR.NoProficiency:
      return i18n.t('language-editor.label.ilr-no-proficiency') as string;
    case ILR.Elementary:
      return i18n.t('language-editor.label.ilr-elementary') as string;
    case ILR.LimitedWorking:
      return i18n.t('language-editor.label.ilr-limited-working') as string;
    case ILR.ProfessionalWorking:
      return i18n.t('language-editor.label.ilr-professional-working') as string;
    case ILR.FullProfessional:
      return i18n.t('language-editor.label.ilr-full-professional') as string;
    case ILR.Native:
      return i18n.t('language-editor.label.ilr-native') as string;
    default:
      throw new Error(`Unknow ILR scale '${value}'.`);
  }
}

function formatIELTS(i18n: IVueI18n, value: IELTS): string {
  const band = { score: value.bandScore };

  switch (value.type) {
    case IELTSType.GeneralTraining:
      return i18n.t('language-editor.label.ielts-general-display', band) as string;
    case IELTSType.Academic:
      return i18n.t('language-editor.label.ielts-academic-display', band) as string;
    default:
      throw new Error(`Unknow IELTS module '${value.type}'.`);
  }
}
