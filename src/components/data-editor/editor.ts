import Vue, { provide, VueConstructor, watch } from 'vue';
import { TranslateResult } from 'vue-i18n';
import { DateMonth, TelephoneNumber } from '@/clients/rest';
import { useTranslation } from '@/i18n';
import { I18n } from '@/services';
import { inject } from '@/util/injector';
import { Uuid } from '@/util/uuid';
import { EditorComponent } from './component';
import { ContextKey } from './context';
import { FieldValue } from './field';
import { getDataMetadata, getPropertyLabel } from './metadata';
import { Props } from './props';
import { DataFlags, DataState, ResultFactory, StateKey } from './state';
import { UpdateWriter } from './update';
import { isAllowedAlphabets } from './validators';

export interface DataEditor extends EditorComponent {
  id: string;
  type: string;
  lang: string;
  state: DataState;
  noInputError: TranslateResult;
  unsupportedAlphabetsError: TranslateResult;

  isAllowedAlphabets(s: string): boolean;
}

export const DataEditor = (Vue as VueConstructor<EditorComponent>).extend({
  mixins: [EditorComponent],
  props: {
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    lang: {
      type: String,
      required: true
    },
    state: {
      type: DataState,
      required: true
    }
  },
  computed: {
    noInputError: function (): TranslateResult {
      return this.$t('data-editor.message.no-input');
    },
    unsupportedAlphabetsError: function(): TranslateResult {
      return this.$t('data-editor.message.unsupported-alphabets');
    }
  },
  provide: function (): object {
    return {
      [StateKey as symbol]: this.state
    };
  },
  created: function () {
    // set result factory
    const result = (this as any).createUpdate;

    if (typeof result !== 'function') {
      throw new Error("Cannot find 'createUpdate' method. Did you forgot to define it in your editor component?");
    }

    this.$emit('result', result);

    // collect all data fields
    const fields = new Array<string>();

    for (const p in this.$data) {
      const v = this.$data[p];

      if (v instanceof FieldValue) {
        fields.push(p);
      }
    }

    // watch error
    this.$watch(
      function (): boolean {
        for (const f of fields) {
          const v = this.$data[f] as FieldValue<unknown>;
          if (v.error) {
            return true;
          }
        }

        return false;
      },
      function (n) {
        this.$emit('change', n ? DataFlags.Error : DataFlags.None);
      },
      {
        immediate: true
      }
    );

    // watch changed
    this.$watch(
      function (): boolean {
        for (const f of fields) {
          const v = this.$data[f] as FieldValue<unknown>;
          if (v.changed) {
            return true;
          }
        }

        return false;
      },
      function (v) {
        this.$emit('dirty', v);
      },
      {
        immediate: true
      }
    );
  },
  methods: {
    label: function (field?: string): TranslateResult {
      if (field === undefined) {
        return getDataMetadata(this.type).label(this.$i18n);
      } else {
        return getPropertyLabel(this.$i18n, this.type, field);
      }
    },
    desc: function (prop?: string): string | null {
      return this.context.getDescription(this.type, prop);
    },
    requireNonNull: function (v: unknown): TranslateResult | null {
      return v === null ? this.noInputError : null;
    },
    requireNonEmpty: function (v: string): TranslateResult | null {
      return v ? null : this.noInputError;
    },
    requireValidString: function (max: number): (v: string) => TranslateResult | null {
      return (v: string) => {
        v = v.trim();

        if (!v) {
          return this.noInputError;
        } else if (v.length > max) {
          return this.$t('data-editor.message.string-too-long', { max });
        } else if (!this.isAllowedAlphabets(v)) {
          return this.unsupportedAlphabetsError;
        } else {
          return null;
        }
      };
    },
    requireValidEmail: function (s: string): TranslateResult | null {
      s = s.trim();

      if (!s) {
        return this.noInputError;
      } else if (s.length > 254 || !isAllowedAlphabets(s, 'en')) {
        return this.$t('resume-email-address-data.message.invalid-input');
      } else {
        // TODO: enforce email to be the same format as server
        return null;
      }
    },
    convertNoop: function (v: unknown): unknown {
      return v;
    },
    convertStringToUUID: function (v: string | null): Uuid | null {
      return v === null ? null : new Uuid(v);
    },
    compareUUID: function (local: Uuid | null, remote: Uuid | null): boolean {
      if (local === null && remote === null) {
        return true;
      } else if (local && remote) {
        return local.equals(remote);
      } else {
        return false;
      }
    },
    convertDateMonth: function (v: DateMonth | null): DateMonth | null {
      return v;
    },
    compareDateMonth: function (local: DateMonth | null, remote: DateMonth | null): boolean {
      if (local === null && remote === null) {
        return true;
      } else if (local && remote) {
        return local.equals(remote);
      } else {
        return false;
      }
    },
    convertTelephoneNumber: function (v: TelephoneNumber | null): TelephoneNumber | null {
      return v;
    },
    compareTelephoneNumber: function (local: TelephoneNumber | null, remote: TelephoneNumber | null): boolean {
      if (local === null && remote === null) {
        return true;
      } else if (local && remote) {
        return local.equals(remote);
      } else {
        return false;
      }
    },
    isAllowedAlphabets: function (s: string): boolean {
      return isAllowedAlphabets(s, this.lang);
    }
  }
});

export function useDataEditor<Fields extends { [k: string]: FieldValue<unknown> }>(
  props: Readonly<Props>,
  emit: { (e: 'result', v: ResultFactory): void; (e: 'change', v: DataFlags): void; (e: 'dirty', v: boolean): void },
  fields: Fields,
  result: (this: Fields, w: UpdateWriter) => void) {
  const { t } = useTranslation();

  // app services
  const i18n = inject(I18n);

  // editor states
  const context = inject(ContextKey);

  // functions
  const label = function (field?: string): string {
    if (field === undefined) {
      return getDataMetadata(props.type).label(i18n) as string;
    } else {
      return getPropertyLabel(i18n, props.type, field) as string;
    }
  };

  const desc = function (prop?: string): string | undefined {
    return context.getDescription(props.type, prop) ?? undefined;
  };

  const nonNull = function (v: unknown): string | null {
    return v === null ? t('data-editor.message.no-input') : null;
  };

  const nonEmpty = function (v: string): string | null {
    return v ? null : t('data-editor.message.no-input');
  };

  const string = function (max: number): (v: string) => string | null {
    return function (v: string) {
      v = v.trim();

      if (!v) {
        return t('data-editor.message.no-input');
      } else if (v.length > max) {
        return t('data-editor.message.string-too-long', { max });
      } else if (!isAllowedAlphabets(v, props.lang)) {
        return t('data-editor.message.unsupported-alphabets');
      } else {
        return null;
      }
    };
  };

  // watches
  watch(() => Object.values(fields).some(f => f.error), n => emit('change', n ? DataFlags.Error : DataFlags.None), { immediate: true });
  watch(() => Object.values(fields).some(f => f.changed), v => emit('dirty', v), { immediate: true });

  // provides
  provide(StateKey, props.state);

  // set result factory
  emit('result', result.bind(fields));

  return { label, desc, nonNull, nonEmpty, string };
}
