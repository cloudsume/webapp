import Vue, { VNode } from 'vue';
import { TelephoneNumber } from '@/clients/rest';
import FlagIcon from '@/components/flag-icon';

export default Vue.extend({
  functional: true,
  props: {
    value: {
      type: TelephoneNumber,
      required: true
    }
  },
  render: function (h, { props }): VNode | VNode[] {
    const flag = h(FlagIcon, {
      attrs: {
        country: props.value.country
      }
    });

    return h('div', {
    }, [flag, '\xa0', props.value.number]);
  }
});
