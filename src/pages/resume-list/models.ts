import { RegistrationCategory } from '@/clients/template-registration';
import { Uuid } from '@/util/uuid';

export interface TemplateInfo {
  registrationId: Uuid;
  user: Uuid;
  name: string;
  category: RegistrationCategory;
  locale: string;
}
