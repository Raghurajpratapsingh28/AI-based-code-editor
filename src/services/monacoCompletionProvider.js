// src/services/monacoCompletionProvider.js

import { getCompletions, getQuickFixes,getSnippets } from './compltionService';

export default class AICompletionProvider {
  constructor(language) {
    this.language = language;
    this.disposables = [];
  }

  init(editor, monaco) {
    this.registerCompletionProvider(editor, monaco);
    this.registerQuickFixProvider(editor, monaco);
    this.registerSnippetProvider(editor, monaco);
  }

  dispose() {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }

  registerCompletionProvider(editor, monaco) {
    const provider = monaco.languages.registerCompletionItemProvider(this.language, {
      triggerCharacters: ['.', '(', '{', '[', '"', "'", ' '],
      async provideCompletionItems(model, position) {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: Math.max(1, position.lineNumber - 10),
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const wordInfo = model.getWordUntilPosition(position);
        const completions = await getCompletions(
          textUntilPosition,
          position,
          { language: this.language }
        );

        return {
          suggestions: (completions.suggestions || []).map(suggestion => ({
            label: suggestion.text,
            kind: monaco.languages.CompletionItemKind.Text,
            insertText: suggestion.text,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: wordInfo.startColumn,
              endLineNumber: position.lineNumber,
              endColumn: wordInfo.endColumn
            },
            detail: suggestion.detail || 'AI Suggestion',
            documentation: suggestion.documentation || 'AI-generated completion'
          }))
        };
      }
    });

    this.disposables.push(provider);
  }

  registerQuickFixProvider(editor, monaco) {
    const provider = monaco.languages.registerCodeActionProvider(this.language, {
      async provideCodeActions(model, range, context) {
        const markers = context.markers;
        if (!markers || markers.length === 0) return { actions: [], dispose: () => {} };

        const fixes = await getQuickFixes(model.getValue(), markers);
        
        return {
          actions: (fixes.fixes || []).map(fix => ({
            title: fix.title,
            kind: monaco.languages.CodeActionKind.QuickFix,
            edit: {
              edits: [{
                resource: model.uri,
                edit: {
                  range: fix.range,
                  text: fix.text
                }
              }]
            }
          })),
          dispose: () => {}
        };
      }
    });

    this.disposables.push(provider);
  }

  registerSnippetProvider(editor, monaco) {
    const that = this; // Store reference to this
    const provider = monaco.languages.registerCompletionItemProvider(this.language, {
      triggerCharacters: ['!'],
      async provideCompletionItems(model, position) {
        const snippets = await getSnippets(that.language);
        
        return {
          suggestions: (snippets.snippets || []).map(snippet => ({
            label: snippet.name,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: snippet.code,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: snippet.description,
            documentation: {
              value: `\`\`\`${that.language}\n${snippet.code}\n\`\`\``
            }
          }))
        };
      }
    });

    this.disposables.push(provider);
  }
}