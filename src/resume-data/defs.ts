export type DataType =
  'address' |
  'certificate' |
  'education' |
  'email' |
  'experience' |
  'github' |
  'headline' |
  'language' |
  'linkedin' |
  'mobile' |
  'name' |
  'photo' |
  'skill' |
  'summary' |
  'website';

export type AddressProp = 'region' | 'street';
export type CertificateProp = 'name' | 'obtained';
export type EducationProp = 'degree' | 'description' | 'end' | 'grade' | 'institute' | 'region' | 'start';
export type ExperienceProp = 'company' | 'description' | 'end' | 'region' | 'start' | 'street' | 'title';
export type LanguageProp = 'comment' | 'language' | 'proficiency';
export type NameProp = 'first' | 'last' | 'middle';
export type SkillProp = 'name' | 'proficiency';
