import { IELTS, ILR, LanguageProficiency, LanguageProficiencyType } from '@/clients/resume-data';

export class State {
  type: LanguageProficiencyType | null;
  value: ILR | number | IELTS | null;

  constructor() {
    this.type = null;
    this.value = null;
  }

  reset(): void {
    this.type = null;
    this.value = null;
  }

  load(src: LanguageProficiency): void {
    this.type = src.type;
    this.value = src.value;
  }

  updateType(v: LanguageProficiencyType | null): void {
    this.type = v;
    this.value = null;
  }

  updateValue(v: ILR | number | IELTS | null): void {
    this.value = v;
  }
}
