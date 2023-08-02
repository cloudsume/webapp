import { InvalidProperty, JsonClass, JsonProperty, MappingContext, Type } from '@ultimicro/json-mapper';
import { DateMonth, TelephoneNumber } from '@/clients/rest';
import { Uuid } from '@/util/uuid';

@JsonClass()
export class ResumeData {
  @JsonProperty()
  type: string;

  @JsonProperty()
  updatedAt: Date;

  @JsonProperty({ discriminator: getDataType })
  value: object;

  constructor(type: string, updatedAt: Date, value: object) {
    this.type = type;
    this.updatedAt = updatedAt;
    this.value = value;
  }
}

@JsonClass()
export class MultiplicableData {
  @JsonProperty()
  id: Uuid;

  @JsonProperty({ type: Uuid })
  base: Uuid | null;

  constructor(id: Uuid, base: Uuid | null) {
    this.id = id;
    this.base = base;
  }
}

export const enum PropertyFlags {
  None = 0x00,
  Disabled = 0x01
}

@JsonClass()
export class DataProperty<T> {
  @JsonProperty()
  flags: PropertyFlags;

  @JsonProperty({ type: 0, required: false })
  value: T | null;

  constructor(flags: PropertyFlags, value: T | null) {
    this.flags = flags;
    this.value = value;
  }
}

@JsonClass()
export class GlobalData {
  @JsonProperty()
  culture: string;

  @JsonProperty()
  data: ResumeData;

  constructor(culture: string, data: ResumeData) {
    this.culture = culture;
    this.data = data;
  }
}

@JsonClass()
export class ResumeName {
  @JsonProperty({ args: [String] })
  firstName: DataProperty<string>;

  @JsonProperty({ args: [String] })
  middleName: DataProperty<string>;

  @JsonProperty({ args: [String] })
  lastName: DataProperty<string>;

  constructor(firstName: DataProperty<string>, middleName: DataProperty<string>, lastName: DataProperty<string>) {
    this.firstName = firstName;
    this.middleName = middleName;
    this.lastName = lastName;
  }
}

@JsonClass()
export class ResumeAddress {
  @JsonProperty({ args: [String] })
  region: DataProperty<string>;

  @JsonProperty({ args: [String] })
  street: DataProperty<string>;

  constructor(region: DataProperty<string>, street: DataProperty<string>) {
    this.region = region;
    this.street = street;
  }
}

@JsonClass()
export class ResumeExperience extends MultiplicableData {
  @JsonProperty({ args: [DateMonth] })
  start: DataProperty<DateMonth>;

  @JsonProperty({ args: [DateMonth] })
  end: DataProperty<DateMonth>;

  @JsonProperty({ args: [String] })
  title: DataProperty<string>;

  @JsonProperty({ args: [String] })
  company: DataProperty<string>;

  @JsonProperty({ args: [String] })
  region: DataProperty<string>;

  @JsonProperty({ args: [String] })
  street: DataProperty<string>;

  @JsonProperty({ args: [String] })
  description: DataProperty<string>;

  constructor(
    id: Uuid,
    base: Uuid | null,
    start: DataProperty<DateMonth>,
    end: DataProperty<DateMonth>,
    title: DataProperty<string>,
    company: DataProperty<string>,
    region: DataProperty<string>,
    street: DataProperty<string>,
    description: DataProperty<string>) {
    super(id, base);

    this.start = start;
    this.end = end;
    this.title = title;
    this.company = company;
    this.region = region;
    this.street = street;
    this.description = description;
  }
}

@JsonClass()
export class ResumeEducation extends MultiplicableData {
  @JsonProperty({ args: [String] })
  institute: DataProperty<string>;

  @JsonProperty({ args: [String] })
  region: DataProperty<string>;

  @JsonProperty({ args: [String], optional: true })
  campus?: DataProperty<string>;

  @JsonProperty({ args: [String] })
  degreeName: DataProperty<string>;

  @JsonProperty({ args: [String], optional: true })
  degree?: DataProperty<string>;

  @JsonProperty({ args: [DateMonth] })
  start: DataProperty<DateMonth>;

  @JsonProperty({ args: [DateMonth] })
  end: DataProperty<DateMonth>;

  @JsonProperty({ args: [String] })
  grade: DataProperty<string>;

  @JsonProperty({ args: [String] })
  description: DataProperty<string>;

  constructor(
    id: Uuid,
    base: Uuid | null,
    institute: DataProperty<string>,
    region: DataProperty<string>,
    degree: DataProperty<string>,
    start: DataProperty<DateMonth>,
    end: DataProperty<DateMonth>,
    grade: DataProperty<string>,
    description: DataProperty<string>) {
    super(id, base);

    this.institute = institute;
    this.region = region;
    this.degreeName = degree;
    this.start = start;
    this.end = end;
    this.grade = grade;
    this.description = description;
  }
}

@JsonClass()
export class ResumeCertificate extends MultiplicableData {
  @JsonProperty({ args: [String] })
  name: DataProperty<string>;

  @JsonProperty({ args: [DateMonth] })
  obtained: DataProperty<DateMonth>;

  constructor(id: Uuid, base: Uuid | null, name: DataProperty<string>, obtained: DataProperty<DateMonth>) {
    super(id, base);
    this.name = name;
    this.obtained = obtained;
  }
}

export const enum SkillLevel {
  Novice = 3,
  Expert = 7
}

@JsonClass()
export class ResumeSkill extends MultiplicableData {
  @JsonProperty({ args: [String] })
  name: DataProperty<string>;

  @JsonProperty({ args: [Uuid], optional: true })
  skillId?: DataProperty<Uuid>;

  @JsonProperty({ args: [Number] })
  level: DataProperty<SkillLevel>;

  constructor(id: Uuid, base: Uuid | null, name: DataProperty<string>, level: DataProperty<SkillLevel>) {
    super(id, base);

    this.name = name;
    this.level = level;
  }
}

export const enum LanguageProficiencyType {
  ILR = 0,
  TOEIC = 1,
  IELTS = 2,
  TOEFL = 3
}

export const enum ILR {
  NoProficiency = 0,
  Elementary = 1,
  LimitedWorking = 2,
  ProfessionalWorking = 3,
  FullProfessional = 4,
  Native = 5
}

export const enum IELTSType {
  GeneralTraining = 0,
  Academic = 1
}

@JsonClass()
export class IELTS {
  @JsonProperty()
  type: IELTSType;

  @JsonProperty()
  bandScore: number;

  constructor(type: IELTSType, bandScore: number) {
    this.type = type;
    this.bandScore = bandScore;
  }
}

@JsonClass()
export class LanguageProficiency {
  @JsonProperty()
  type: LanguageProficiencyType;

  @JsonProperty({ discriminator: getLanguageProficiencyValueType })
  value: ILR | number | IELTS;

  constructor(type: LanguageProficiencyType.ILR, value: ILR);
  constructor(type: LanguageProficiencyType.TOEIC, value: number);
  constructor(type: LanguageProficiencyType.IELTS, value: IELTS);
  constructor(type: LanguageProficiencyType.TOEFL, value: number);
  constructor(type: LanguageProficiencyType, value: ILR | number | IELTS);
  constructor(type: LanguageProficiencyType, value: ILR | number | IELTS) {
    this.type = type;
    this.value = value;
  }
}

@JsonClass()
export class ResumeLanguage extends MultiplicableData {
  @JsonProperty({ args: [String] })
  tag: DataProperty<string>;

  @JsonProperty({ args: [LanguageProficiency] })
  proficiency: DataProperty<LanguageProficiency>;

  @JsonProperty({ args: [String] })
  comment: DataProperty<string>;

  constructor(
    id: Uuid,
    base: Uuid | null,
    tag: DataProperty<string>,
    proficiency: DataProperty<LanguageProficiency>,
    comment: DataProperty<string>) {
    super(id, base);

    this.tag = tag;
    this.proficiency = proficiency;
    this.comment = comment;
  }
}

@JsonClass()
export class GlobalUpdateResult {
  @JsonProperty({ args: [ResumeData] })
  updatedData: ResumeData[];

  @JsonProperty({ args: [Uuid] })
  affectedResumes: Uuid[];

  constructor(updatedData: ResumeData[], affectedResumes: Uuid[]) {
    this.updatedData = updatedData;
    this.affectedResumes = affectedResumes;
  }
}

function getDataType(ctx: MappingContext, obj: ResumeData): Type {
  switch (obj.type) {
    case 'name':
      return ResumeName;
    case 'headline':
    case 'photo':
    case 'summary':
    case 'email':
    case 'linkedin':
    case 'github':
    case 'website':
      return [DataProperty, [String]];
    case 'address':
      return ResumeAddress;
    case 'mobile':
      return [DataProperty, [TelephoneNumber]];
    case 'experience':
      return ResumeExperience;
    case 'education':
      return ResumeEducation;
    case 'certificate':
      return ResumeCertificate;
    case 'skill':
      return ResumeSkill;
    case 'language':
      return ResumeLanguage;
    default:
      throw new InvalidProperty(`Unknow data type ${obj.type}.`, ctx.pathFor('type', 1));
  }
}

function getLanguageProficiencyValueType(ctx: MappingContext, obj: LanguageProficiency): Type {
  switch (obj.type) {
    case LanguageProficiencyType.ILR:
    case LanguageProficiencyType.TOEIC:
    case LanguageProficiencyType.TOEFL:
      return Number;
    case LanguageProficiencyType.IELTS:
      return IELTS;
    default:
      throw new InvalidProperty(`Unknow proficiency type ${obj.type}.`, ctx.pathFor('type', 1));
  }
}
