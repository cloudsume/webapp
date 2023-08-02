import * as monaco from 'monaco-editor';

export const TexToken: monaco.languages.IMonarchLanguage = {
  defaultToken: 'invalid',
  tokenizer: {
    root: [
      {
        regex: /%.*$/,
        action: { token: 'comment' }
      },
      {
        regex: /\\\w+\*?/,
        action: { token: 'identifier' }
      },
      {
        regex: /\\\\/,
        action: { token: 'identifier' }
      },
      {
        regex: /{/,
        action: { token: '@brackets', next: '@root' }
      },
      {
        regex: /}/,
        action: { token: '@brackets', next: '@pop' }
      },
      {
        regex: /\[/,
        action: { token: '@brackets', next: '@root' }
      },
      {
        regex: /\]/,
        action: { token: '@brackets', next: '@pop' }
      },
      {
        regex: /./,
        action: { token: 'string' }
      }
    ]
  }
};
