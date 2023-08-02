import { InjectionKey } from 'vue';
import { DataProperty } from '@/clients/resume-data';

export const ContextKey = Symbol('Key for EditingContext') as InjectionKey<EditingContext<unknown>>;

export abstract class EditingContext<P> {
  saving: boolean;

  constructor() {
    this.saving = false;
  }

  abstract getDescription(type: string, prop?: string): string | null;
  abstract getParentValue(parent: P, selector: (data: object) => DataProperty<unknown>): unknown;
}
