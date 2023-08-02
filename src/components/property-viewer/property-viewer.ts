import { BSkeleton } from 'bootstrap-vue';
import Vue, { VNode } from 'vue';
import { DateMonth, TelephoneNumber } from '@/clients/rest';
import { DataProperty, LanguageProficiency, SkillLevel as SkillLevelValue } from '@/clients/resume-data';
import { getDataMetadata, getPropertyMetadata, getSkillLevelLabel, PropertyType } from '@/components/data-editor';
import TelephoneViewer from '@/components/telephone-viewer';
import { getCountryCode, getCountryName, getLanguageName, getSubdivisionName } from '@/i18n';
import { formatLanguageProficiency } from '@/resume-data';
import { RemoteData } from '@/util/remote-data';
import ImageViewer from './image-viewer.vue';

export default Vue.extend({
  props: {
    type: {
      type: String,
      required: true
    },
    field: String,
    value: {}
  },
  computed: {
    display: function (): unknown {
      let value = unpack(this.value);

      if (value !== null) {
        // get value type
        let type;

        if (this.field) {
          type = getPropertyMetadata(this.type, this.field).type;
        } else {
          type = getDataMetadata(this.type).type;

          if (type === undefined) {
            throw new Error('The field that is being displaying is a simple field but the metadata tell it is not.');
          }
        }

        // convert value for display
        switch (type) {
          case PropertyType.Division:
            value = new Division(value as string);
            break;
          case PropertyType.Image:
            value = new ImageURL(value as string);
            break;
          case PropertyType.Language:
            value = new Language(value as string);
            break;
          case PropertyType.Multiline:
            value = new MultilineText(value as string);
            break;
          case PropertyType.SkillLevel:
            value = new SkillLevel(value as SkillLevelValue);
            break;
        }
      }

      if (value instanceof RemoteData) {
        return Vue.observable(value);
      } else {
        return value;
      }
    }
  },
  methods: {
    formatDateMonth: function (v: DateMonth): string {
      const l = this.$store.state.locale;
      const d = new Date();

      d.setFullYear(v.year, v.month, 1);

      return d.toLocaleDateString(l, { month: 'short', year: 'numeric' });
    },
    formatDivision: function ({ id }: Division): string {
      const l = this.$store.state.locale;
      const c = getCountryCode(id);

      return `${getSubdivisionName(id, l)}, ${getCountryName(c, l)}`;
    },
    formatLanguage: function ({ tag }: Language): string {
      return getLanguageName(tag, this.$store.state.locale);
    },
    formatSkillLevel: function ({ value }: SkillLevel): string {
      return getSkillLevelLabel(this.$i18n, value) as string;
    }
  },
  render: function (h): VNode {
    // get remote value
    let value;

    if (this.display instanceof RemoteData) {
      if (this.display.busy) {
        return h(BSkeleton);
      }

      value = this.display.value;
    } else {
      value = this.display;
    }

    // convert value to string if possible
    if (value instanceof DateMonth) {
      value = this.formatDateMonth(value);
    } else if (value instanceof Division) {
      value = this.formatDivision(value);
    } else if (value instanceof Language) {
      value = this.formatLanguage(value);
    } else if (value instanceof LanguageProficiency) {
      value = formatLanguageProficiency(this.$i18n, value);
    } else if (value instanceof SkillLevel) {
      value = this.formatSkillLevel(value);
    }

    // render value
    if (value === null || typeof value === 'string') {
      const content = this.$scopedSlots['single-line'];

      if (content) {
        return h('div', content({ value }));
      } else {
        return h('span', { style: 'white-space: nowrap' }, [value]);
      }
    } else if (value instanceof MultilineText) {
      const content = this.$scopedSlots['multi-line'];

      if (content) {
        return h('div', content({ value: value.value }));
      } else {
        return h('span', { style: 'white-space: pre-wrap' }, [value.value]);
      }
    } else if (value instanceof TelephoneNumber) {
      return h(TelephoneViewer, {
        attrs: { value }
      });
    } else if (value instanceof ImageURL) {
      return h(ImageViewer, {
        attrs: { url: value.url }
      });
    } else {
      throw new Error(`Don't know how to render '${value}'.`);
    }
  }
});

function unpack<T>(v: DataProperty<T> | T | null): T | null {
  if (v instanceof DataProperty) {
    return v.value;
  } else {
    return v;
  }
}

class Division {
  constructor(readonly id: string) {
  }
}

class ImageURL {
  constructor(readonly url: string) {
  }
}

class MultilineText {
  constructor(readonly value: string) {
  }
}

class SkillLevel {
  constructor(readonly value: SkillLevelValue) {
  }
}

class Language {
  constructor(readonly tag: string) {
  }
}
