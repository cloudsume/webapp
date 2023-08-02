import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { Client } from './src/clients/rest';
import { Source } from './src/store';

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    rest?: Client;
    fetch?: () => Promise<any>;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $rest: Client;

    $error(source: Source, message: () => TranslateResult, error?: Error): void;
    $refetch(): Promise<any>;
  }
}
