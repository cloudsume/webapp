import Vue, { VNode, VNodeData } from 'vue';

export default Vue.extend({
  functional: true,
  props: {
    items: {
      type: Array,
      required: true
    },
    primaryKey: {
      type: [String, Function],
      required: true
    },
    busy: {
      type: Boolean
    },
    cols: {
      type: [Number, String]
    },
    sm: {
      type: [Number, String]
    },
    md: {
      type: [Number, String]
    },
    lg: {
      type: [Number, String]
    },
    xl: {
      type: [Number, String]
    }
  },
  render: function (h, { props, scopedSlots, data }): VNode {
    const cols = new Array<VNode>();
    const commons = (): VNodeData => ({
      style: 'margin-bottom: 10px',
      attrs: {
        cols: props.cols,
        sm: props.sm,
        md: props.md,
        lg: props.lg,
        xl: props.xl
      }
    });

    if (props.busy) {
      cols.push(h('b-col', commons(), scopedSlots['deck-busy'](undefined)));
    } else {
      const footer = scopedSlots.footer;

      for (const i of props.items) {
        const opts = commons();
        opts.key = typeof props.primaryKey === 'function' ? props.primaryKey(i) : (i as any)[props.primaryKey];
        cols.push(h('b-col', opts, scopedSlots.default({ item: i })));
      }

      if (footer !== undefined) {
        cols.push(h('b-col', commons(), footer({})));
      }
    }

    return h('b-form-row', {
      class: data.class,
      style: data.style ?? 'padding-bottom: 6px',
    }, cols);
  }
});
