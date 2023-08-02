import * as monaco from 'monaco-editor';

export const DarkTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'attribute.resume', foreground: 'FFA500' },
    { token: 'delimiter.curly', foreground: '00FFA5' },
    { token: 'delimiter.interpolation.resume', foreground: 'FF00A5' },
    { token: 'delimiter.square', foreground: '00FFA5' },
    { token: 'delimiter.template.resume', foreground: 'A5FF00' },
    { token: 'identifier.template.resume', foreground: 'FFA500' }
  ],
  colors: {}
};
