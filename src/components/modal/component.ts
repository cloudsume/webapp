import { BCol, BContainer, BModal, BOverlay, BRow, BvModalEvent } from 'bootstrap-vue';
import Vue, { VNode } from 'vue';
import Alert from '@/components/alert';
import { RemoveAlert, Source } from '@/store';
import { ModalContext } from './models';

export default Vue.extend({
  inheritAttrs: false,
  props: ['value', 'context', 'v2', 'v3', 'initialBusy'],
  data: function () {
    return {
      visible: isTrue(this.v3),
      data: undefined as unknown,
      busy: isTrue(this.initialBusy),
      result: undefined as unknown
    };
  },
  computed: {
    isV2: function (): boolean {
      return isTrue(this.v2);
    },
    isV3: function (): boolean {
      return isTrue(this.v3);
    }
  },
  watch: {
    'value': {
      immediate: true,
      handler: function (current: any): void {
        if (this.isV2 || this.isV3) {
          return;
        }

        if (current !== undefined) {
          this.data = current;
          this.visible = true;
        } else {
          this.visible = false;
        }
      }
    },
    'context': {
      immediate: true,
      handler: function (n): void {
        if (!this.isV2) {
          return;
        }

        if (n !== null) {
          this.data = n;
          this.visible = true;
        } else {
          this.visible = false;
        }
      }
    }
  },
  render: function (h): VNode {
    const props: Record<string, any> = {};
    const slots: { [key: string]: ((props: any) => VNode[] | undefined) | undefined } = {};

    // default props
    props.cancelTitle = this.$t('modal.label.cancel');
    props.centered = true;
    props.okTitle = this.$t('modal.label.ok');
    props.scrollable = true;

    for (const name in this.$attrs) {
      // we need to convert kebab-case to camel case due to vue template compiler did not do for us
      props[name.replace(/-\w/g, t => t.replace(/-/, '').toUpperCase())] = this.$attrs[name];
    }

    // override props
    props.visible = this.visible;

    if (this.isV2 && this.data instanceof ModalContext && this.data.title !== undefined) {
      props.title = typeof this.data.title === 'function' ? this.data.title() : this.data.title;
    }

    if (this.isV3) {
      if ('bodyClass' in props) {
        props.bodyClass += ' position-static';
      } else {
        props.bodyClass = 'position-static';
      }

      delete props.busy;
    }

    // slots
    const body = (props: any) => {
      let nodes;

      if (this.isV3) {
        nodes = this.wrapSlot('default')(props);
      } else {
        nodes = this.$scopedSlots['default']!({ ...props, data: this.data, context: this.data });
      }

      return nodes ?? [];
    };

    const post = () => {
      const slot = this.$scopedSlots['post-body'];
      return slot ? slot({}) ?? [] : [];
    }

    const content = (props: any) => {
      const children = new Array<VNode>();

      // alerts
      for (const alert of this.$store.state.alerts) {
        const view = h(Alert, {
          props: { data: alert },
          on: {
            dismissed: (id: string) => this.$store.commit(new RemoveAlert(Source.User, id))
          }
        });
        const col = h(BCol, [view]);
        const row = h(BRow, { key: alert.id }, [col]);

        children.push(row);
      }

      // content
      children.push(...body(props));

      // container
      const container = h(BContainer, {
        class: 'px-0',
        attrs: { fluid: true }
      }, children);

      if (this.isV3) {
        const overlay = h(BOverlay, {
          attrs: {
            show: this.busy,
            noWrap: true,
            rounded: true,
            noFade: true,
            opacity: 1,
            zIndex: 11
          }
        });

        return [container, overlay];
      } else {
        return [container, ...post()];
      }
    };

    for (const name in this.$scopedSlots) {
      if (name === 'default') {
        slots[name] = content;
      } else if (name !== 'post-body' || this.isV3) {
        if (this.isV3) {
          slots[name] = this.wrapSlot(name);
        } else {
          slots[name] = props => this.$scopedSlots[name]!({ ...props, context: this.data });
        }
      }
    }

    // event handlers
    const show = (e: BvModalEvent) => {
      const h = this.$listeners.show;

      if (!h) {
        return;
      }

      if (this.isV3) {
        if (Array.isArray(h)) {
          h.forEach(h => h(this.setBusy));
        } else {
          h(this.setBusy);
        }
      } else if (Array.isArray(h)) {
        h.forEach(h => h(e));
      } else {
        h(e);
      }
    };

    const shown = (e: BvModalEvent) => {
      const h = this.$listeners.shown;

      if (this.isV3) {
        if (Array.isArray(h)) {
          h.forEach(h => h(this.setBusy));
        } else if (h) {
          h(this.setBusy);
        }
      } else if (Array.isArray(h)) {
        h.forEach(h => h(e));
      } else if (h) {
        h(e);
      }
    };

    const ok = (e: BvModalEvent) => {
      const h = this.$listeners.ok;

      if (this.isV3) {
        if (h) {
          e.preventDefault();

          if (Array.isArray(h)) {
            h.forEach(h => h(this.complete, this.setBusy, this.result));
          } else {
            h(this.complete, this.setBusy, this.result);
          }
        } else {
          // force close even if being busy
          this.visible = false;
        }
      } else if (h) {
        if (Array.isArray(h)) {
          h.forEach(h => h(e));
        } else {
          h(e);
        }
      }
    };

    const change = (visible: boolean) => {
      if (!visible && this.visible) {
        if (this.isV2) {
          this.$emit('change', null);
        } else if (this.isV3) {
          this.visible = false;
        } else {
          this.$emit('input', undefined);
        }
      }
    };

    const hide = (e: BvModalEvent) => {
      const h = this.$listeners.hide;

      if (!h) {
        if (this.isV3 && this.busy && this.visible) {
          e.preventDefault();
        }
      } else if (Array.isArray(h)) {
        h.forEach(h => h(e));
      } else {
        h(e);
      }
    };

    const hidden = (e: BvModalEvent) => {
      const h = this.$listeners.hidden;

      if (this.isV3) {
        // clear alerts
        this.$store.commit(new RemoveAlert(Source.App));

        // invoke the handlers.
        if (Array.isArray(h)) {
          h.forEach(h => h(this.result));
        } else if (h) {
          h(this.result);
        }
      } else if (Array.isArray(h)) {
        h.forEach(h => h(e));
      } else if (h) {
        h(e);
      }
    };

    // render
    return h(BModal, {
      props,
      on: { ...this.$listeners, show, shown, ok, change, hide, hidden },
      scopedSlots: slots
    });
  },
  methods: {
    wrapSlot: function (name: string): (props: any) => VNode[] | undefined {
      return props => {
        const overrides = { ...props, busy: this.setBusy };
        const ok = overrides.ok;

        if (ok) {
          overrides.ok = (result: unknown) => {
            this.result = result;
            ok();
          };
        }

        return this.$scopedSlots[name]!(overrides);
      };
    },
    complete: function (result?: unknown): void {
      if (result !== undefined) {
        this.result = result;
      }

      this.visible = false;
    },
    setBusy: function (v: boolean): void {
      this.busy = v;
    }
  }
});

function isTrue(v: unknown): boolean {
  return v === true || v === '';
}
