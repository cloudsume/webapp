import * as monaco from 'monaco-editor';

export const ResumeToken: monaco.languages.IMonarchLanguage = {
  defaultToken: 'invalid',
  identifier: /[a-zA-Z_][a-zA-Z0-9\-_]*/,
  tokenizer: {
    root: [
      {
        regex: /(@identifier)(\()/,
        action: [{ token: 'type' }, { token: '@brackets', next: '@args' }]
      }
    ],
    args: [
      {
        regex: /@identifier/,
        action: { token: 'attribute' }
      },
      {
        regex: /\)/,
        action: { token: '@brackets', next: '@decl' }
      }
    ],
    decl: [
      { include: '@whitespace' },
      {
        regex: /\:\:=/,
        action: { token: 'operators', next: '@body' }
      }
    ],
    body: [
      { include: '@whitespace' },
      {
        regex: /<</,
        action: { token: 'delimiter.template', next: '@multi' }
      },
      {
        regex: /"/,
        action: { token: 'delimiter.template', next: '@single' }
      }
    ],
    multi: [
      {
        regex: />>/,
        action: { token: 'delimiter.template', next: '@popall' }
      },
      { include: '@template' }
    ],
    single: [
      {
        regex: /"/,
        action: { token: 'delimiter.template', next: '@popall' }
      },
      { include: '@template' }
    ],
    template: [
      {
        regex: /%.*$/,
        action: { token: 'comment' }
      },
      {
        regex: /\\\w+\*?/,
        action: { token: 'identifier.tex' }
      },
      {
        regex: /{/,
        action: { token: '@brackets.tex', next: '@template' }
      },
      {
        regex: /}/,
        action: { token: '@brackets.tex', next: '@pop' }
      },
      {
        regex: /\[/,
        action: { token: '@brackets.tex', next: '@template' }
      },
      {
        regex: /\]/,
        action: { token: '@brackets.tex', next: '@pop' }
      },
      {
        regex: /<\!/,
        action: { token: 'comment', next: '@comment' }
      },
      {
        regex: /</,
        action: { token: 'delimiter.interpolation', next: '@sub' }
      },
      {
        regex: /\\\\/,
        action: { token: 'delimiter.interpolation' }
      },
      {
        regex: /./,
        action: { token: 'string' }
      }
    ],
    sub: [
      { include: '@whitespace' },
      {
        regex: />/,
        action: { token: 'delimiter.interpolation', next: '@pop' }
      },
      {
        regex: /(if)(\()/,
        action: [{ token: 'keyword' }, { token: '@brackets' }]
      },
      {
        regex: /else|endif/,
        action: { token: 'keyword' }
      },
      {
        regex: /\w+/,
        action: { token: 'identifier.template' }
      },
      {
        regex: /[\(\)]/,
        action: { token: '@brackets' }
      },
      {
        regex: /\./,
        action: { token: 'delimiter' }
      },
      {
        regex: /&&/,
        action: { token: 'delimiter' }
      }
    ],
    comment: [
      {
        regex: /\!>/,
        action: { token: 'comment', next: '@pop' }
      },
      {
        regex: /./,
        action: { token: 'comment' }
      }
    ],
    whitespace: [
      {
        regex: /[ \t\r\n]+/,
        action: { token: '' }
      }
    ]
  }
};
