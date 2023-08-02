import Vue from 'vue';
import { AddAlert, ErrorAlert, SuccessAlert } from '@/store';

export default { install };

function install(vue: typeof Vue): void {
  const mixin = vue.extend({
    beforeCreate: function () {
      this.$error = (source, message, error) => {
        const alert = new ErrorAlert(message);
        const commit = new AddAlert(source, alert);

        this.$store.commit(commit);

        if (error !== undefined) {
          console.error(error);
        }
      };
    }
  });

  vue.mixin(mixin);
}
