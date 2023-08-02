import { RegistrationCategory, TemplateLicense } from '@/clients/template-registration';
import { Template as TemplateInfo } from '@/components/template-info';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';

export class Template extends TemplateInfo {
  id: Uuid;
  user: Uuid;
  name: string;
  description: string;
  template: ULID;
  preview: string | null;
  license: TemplateLicense | null;

  constructor(
    id: Uuid,
    user: Uuid,
    name: string,
    description: string,
    website: string | null,
    locale: string,
    category: RegistrationCategory,
    prices: Map<string, number>,
    resumeCount: number,
    template: ULID,
    preview: string | null,
    license: TemplateLicense | null) {
    super(website, locale, category, prices, resumeCount);
    this.id = id;
    this.user = user;
    this.name = name;
    this.description = description;
    this.template = template;
    this.preview = preview;
    this.license = license;
  }
}
