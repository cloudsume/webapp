import Vue, { VNode } from 'vue';

export default Vue.extend({
  functional: true,
  props: {
    country: {
      type: String,
      required: true
    }
  },
  render: function (h, { props }): VNode | VNode[] {
    return h('span', {
      class: `flag-icon flag-icon-${props.country.toLowerCase()}`
    });
  }
});
