import { BCol, BContainer, BRow } from 'bootstrap-vue';
import Vue, { VNode } from 'vue';
import Alert from '@/components/alert';
import { RemoveAlert, Source } from '@/store';

export default Vue.extend({
  functional: true,
  render: function (h, { parent, children, data }): VNode {
    // generate alerts
    const alerts = new Array<VNode>();

    for (const alert of parent.$store.state.alerts) {
      const view = h(Alert, {
        attrs: {
          data: alert
        },
        on: {
          dismissed: (id: string) => parent.$store.commit(new RemoveAlert(Source.User, id))
        }
      });

      const col = h(BCol, [view]);
      const row = h(BRow, { key: alert.id }, [col]);

      alerts.push(row);
    }

    // render
    return h(BContainer, {
      class: data.staticClass ? `${data.staticClass} mt-3` : 'mt-3'
    }, alerts.concat(children));
  }
});
