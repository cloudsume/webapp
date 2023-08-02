import { BNavbarBrand } from 'bootstrap-vue';
import Vue, { VNode } from 'vue';
import { Session } from '@/state/session';

export default Vue.extend({
  functional: true,
  props: {
    session: Session
  },
  render: function (h, { props }): VNode | VNode[] {
    // logo
    const logo = h('img', {
      attrs: {
        src: require('./logo.png')
      },
      style: 'width: 150px'
    });

    // brand
    let attrs;

    if (props.session) {
      attrs = {
        to: { name: 'index' },
        exact: true
      };
    } else {
      attrs = { href: '/' };
    }

    return h(BNavbarBrand, { attrs }, [logo]);
  }
});
