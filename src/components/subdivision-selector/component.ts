import { parse as parseLocale } from 'bcp-47';
import Vue from 'vue';
import { Module } from '@/config';
import { getSubdivisions, SubdivisionData } from '@/locales';

export default Vue.extend({
  functional: true,
  props: {
    id: {
      type: String
    },
    country: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    state: {
      type: Boolean,
      default: null
    }
  },
  render: function (h, { props, parent, listeners }) {
    // create a list of subdivisions
    let items: Array<Item>;

    if (props.country.length === 0) {
      items = [];
    } else {
      const subs = getSubdivisions(props.country);
      const locale = parent.$store.state[Module.Settings].language;
      let language = locale;

      if (language.length !== 2) {
        const info = parseLocale(language);
        if (info.language === undefined) {
          throw new Error(`Invalid locale ${language}.`);
        }
        language = info.language;
      }

      const map = (s: SubdivisionData): Item => {
        const value = s.id;
        const text = s.name[language];

        if (text === undefined) {
          throw new Error(`Unknow language ${language} for ${value}.`);
        }

        return { value, text };
      }

      items = subs.map(map).sort((a, b) => a.text.localeCompare(b.text, locale));
    }

    // render
    const first = props.country.length === 0
      ? parent.$t('select-subdivision.label.placeholder-no-country')
      : parent.$t('select-subdivision.label.placeholder');

    return h('b-form-select', {
      props: {
        id: props.id,
        options: items,
        disabled: items.length === 0 || props.disabled,
        state: props.state,
        value: props.value
      },
      on: {
        input: listeners.input
      }
    }, [h('b-form-select-option', { props: { value: '' }, slot: 'first' }, first as string)]);
  }
});

interface Item {
  value: string;
  text: string;
}
