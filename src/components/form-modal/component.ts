import { BvModalEvent } from 'bootstrap-vue';
import Vue, { VNode } from 'vue';
import Modal from '@/components/modal';

export default Vue.extend({
  inheritAttrs: false,
  props: {
    valid: {
      type: Boolean,
      default: true
    },
    cancelTitle: {
      type: String
    },
    bodyClass: {
      type: String
    }
  },
  data: function () {
    return {
      busy: false
    };
  },
  methods: {
    content(props: any): VNode[] | undefined {
      const slot = this.$scopedSlots.default;
      return slot ? slot({ ...props, submit: this.submit }) : undefined;
    },
    submit(e: BvModalEvent | Event): void {
      e.preventDefault();

      if (this.valid) {
        this.busy = true;
        this.$emit('submit', this.complete);
      }
    },
    complete(result: any): void {
      this.busy = false;

      if (result !== undefined) {
        // TODO: remove 'input' event
        this.$emit('input', undefined);
        this.$emit('change', null);
        this.$emit('complete', result);
      }
    },
    hide(e: BvModalEvent): void {
      if (this.busy) {
        e.preventDefault();
      }
    }
  },
  render: function (h): VNode {
    const overlay = h('b-overlay', {
      attrs: {
        show: this.busy,
        noWrap: true,
        rounded: true
      },
      slot: 'post-body'
    });

    return h(Modal, {
      attrs: {
        ...this.$attrs,
        cancelTitle: this.cancelTitle ?? this.$t('form-modal.label.cancel-button'),
        okDisabled: !this.valid,
        bodyClass: this.bodyClass !== undefined ? `position-static ${this.bodyClass}` : 'position-static'
      },
      on: {
        ...this.$listeners,
        ok: this.submit,
        hide: this.hide
      },
      scopedSlots: { default: this.content }
    }, [overlay]);
  }
});
