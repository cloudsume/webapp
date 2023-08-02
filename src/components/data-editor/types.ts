export const enum DataType {
  Name = 'name',
  Headline = 'headline',
  Address = 'address',
  Mobile = 'mobile',
  Email = 'email',
  LinkedIn = 'linkedin',
  GitHub = 'github',
  Website = 'website',
  Photo = 'photo',
  Summary = 'summary',
  Experience = 'experience',
  Education = 'education',
  Certificate = 'certificate',
  Skill = 'skill',
  Language = 'language'
}

export const AvailableTypes = new Set<string>([
  DataType.Name,
  DataType.Headline,
  DataType.Address,
  DataType.Mobile,
  DataType.Email,
  DataType.LinkedIn,
  DataType.GitHub,
  DataType.Website,
  DataType.Photo,
  DataType.Summary,
  DataType.Experience,
  DataType.Education,
  DataType.Certificate,
  DataType.Skill,
  DataType.Language
]);

/**
 * Gets maximum number of entries per resume or per job and locale for sample data.
 */
export function maxEntries(type: string): number {
  switch (type) {
    case DataType.Name:
    case DataType.Headline:
    case DataType.Address:
    case DataType.Mobile:
    case DataType.Email:
    case DataType.LinkedIn:
    case DataType.GitHub:
    case DataType.Website:
    case DataType.Photo:
    case DataType.Summary:
      return 1;
    case DataType.Experience:
    case DataType.Language:
      return 5;
    case DataType.Education:
    case DataType.Certificate:
      return 3;
    case DataType.Skill:
      return 10;
    default:
      throw new Error(`Unknow data type ${type}.`);
  }
}
