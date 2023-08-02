import VueI18n from 'vue-i18n';
import { DataProperty } from '@/clients/resume-data';
import { EditingContext } from '@/components/parent-selector';

export class Context extends EditingContext {
  type: string | null;

  constructor(i18n: VueI18n) {
    super(i18n);
    this.type = null;
  }
}

export class EditingData {
  data: object;
  locale: string; // empty for invariant

  constructor(data: object, locale: string) {
    this.data = data;
    this.locale = locale;
  }
}

export class SimpleData {
  constructor(readonly value: DataProperty<unknown>) {
  }
}
