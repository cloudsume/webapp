import { TranslateResult } from 'vue-i18n';
import { Store } from 'vuex';
import { AddAlert, ErrorAlert, Source, State, SuccessAlert } from '@/store';

export class AlertManager {
  constructor(private readonly store: Store<State>) {
  }

  success(source: Source, message: () => TranslateResult) {
    const alert = new SuccessAlert(message);
    const commit = new AddAlert(source, alert);

    this.store.commit(commit);
  };

  error(source: Source, message: () => TranslateResult, error?: Error) {
    const alert = new ErrorAlert(message);
    const commit = new AddAlert(source, alert);

    this.store.commit(commit);

    if (error) {
      console.error(error);
    }
  };
}
