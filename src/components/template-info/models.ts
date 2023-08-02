import { RegistrationCategory } from '@/clients/template-registration';

export class Template {
  website: string | null;
  locale: string;
  category: RegistrationCategory;
  prices: Map<string, number>;
  resumeCount: number;

  constructor(website: string | null, locale: string, category: RegistrationCategory, prices: Map<string, number>, resumeCount: number) {
    this.website = website;
    this.locale = locale;
    this.category = category;
    this.prices = prices;
    this.resumeCount = resumeCount;
  }
}
