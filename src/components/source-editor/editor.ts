import { BFormTextarea } from 'bootstrap-vue';
import * as monaco from 'monaco-editor';
import Vue, { VNode, VueConstructor } from 'vue';
import { ResumeToken } from './resume';
import { TexToken } from './tex';
import { DarkTheme } from './theme';

export default (Vue as VueConstructor<Editor>).extend({
  props: {
    initial: String,
    language: {
      type: String,
      default: 'plaintext'
    }
  },
  data: function () {
    return {
      value: this.initial
    };
  },
  computed: {
    isMobile: function (): boolean {
      // do not make this reactive
      // https://stackoverflow.com/a/45666491/1829232
      return /Mobi/i.test(window.navigator.userAgent);
    }
  },
  watch: {
    'language': function (v: string) {
      if (!this.$monaco) {
        return;
      }

      const model = this.$monaco.getModel();

      if (!model) {
        throw new Error('No model in monaco.');
      }

      monaco.editor.setModelLanguage(model, v);
    }
  },
  beforeCreate: function () {
    this.$changed = false;
  },
  mounted: function () {
    if (this.isMobile) {
      return;
    }

    this.$monaco = monaco.editor.create(this.$refs.monaco as HTMLElement, {
      value: this.value,
      language: this.language,
      theme: 'dark',
      minimap: {
        enabled: false
      }
    });

    this.$monaco.onDidChangeModelContent(() => {
      if (!this.$changed) {
        this.$emit('change', this.getResult);
        this.$changed = true;
      }
    });
  },
  destroyed: function () {
    this.$monaco?.dispose();
  },
  methods: {
    getResult: function (): string {
      this.$changed = false;

      return this.$monaco ? this.$monaco.getValue() : this.value;
    }
  },
  render: function (h): VNode {
    if (this.isMobile) {
      return h(BFormTextarea, {
        attrs: { value: this.value },
        on: {
          update: (v: string) => {
            this.value = v;

            if (!this.$changed) {
              this.$emit('change', this.getResult);
              this.$changed = true;
            }
          }
        }
      });
    } else {
      return h('div', { ref: 'monaco' });
    }
  }
});

interface Editor extends Vue {
  $changed: boolean;
  $monaco?: monaco.editor.IStandaloneCodeEditor;
}

// languages

monaco.languages.register({ id: 'resume' });
monaco.languages.setMonarchTokensProvider('resume', ResumeToken);

monaco.languages.register({ id: 'tex' });
monaco.languages.setMonarchTokensProvider('tex', TexToken);

// themes

monaco.editor.defineTheme('dark', DarkTheme);
