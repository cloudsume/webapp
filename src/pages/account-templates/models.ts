import { PaymentReceivingMethod } from '@/clients/payment-receiving-method';
import { RegistrationCategory, TemplateRegistration } from '@/clients/template-registration';
import { Template as ViewerModel } from '@/components/template-viewer';
import { Empty as EmptyULID, ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';

export const PageContextKey = Symbol();

export class Template extends ViewerModel {
  applicableJobs: Uuid[];
  pendingCategory: RegistrationCategory | null;
  updatedAt: Date;

  constructor(r: TemplateRegistration, t: ULID, p: string | null) {
    super(r.id, r.userId, r.name, r.description, r.website, r.language, r.category, r.prices, r.resumeCount, t, p, null);
    this.applicableJobs = r.applicableJobs;
    this.pendingCategory = null;
    this.updatedAt = r.updatedAt;
  }

  get published(): boolean {
    return !this.template.equals(EmptyULID);
  }
}

export class PageContext {
  payments: PaymentReceivingMethod[];

  constructor() {
    this.payments = [];
  }
}
