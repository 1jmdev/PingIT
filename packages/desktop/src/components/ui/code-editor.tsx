import { useEffect, useRef } from 'react';
import { EditorView, keymap, placeholder as placeholderExt } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { jsonLanguage } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands';
import { LanguageSupport } from '@codemirror/language';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  hasError?: boolean;
}

// Custom light theme that matches the app's design
const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    height: '100%',
  },
  '.cm-content': {
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    fontSize: '14px',
    padding: '8px 0',
    caretColor: '#171717',
  },
  '.cm-line': {
    padding: '0 10px',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#a3a3a3',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(59, 130, 246, 0.2) !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(59, 130, 246, 0.3) !important',
  },
  '.cm-cursor': {
    borderLeftColor: '#171717',
  },
  '.cm-placeholder': {
    color: '#a3a3a3',
    fontStyle: 'normal',
  },
  // JSON syntax colors for light theme
  '.ͼb': { color: '#0550ae' },  // property names (blue)
  '.ͼc': { color: '#0a3069' },  // strings (dark blue)
  '.ͼd': { color: '#0550ae' },  // numbers (blue)
  '.ͼe': { color: '#cf222e' },  // keywords/booleans (red)
  '.ͼf': { color: '#6e7781' },  // brackets/punctuation (gray)
  '.ͼ7': { color: '#0550ae' },  // property names
  '.ͼm': { color: '#116329' },  // string values (green)
  '.ͼo': { color: '#0550ae' },  // numbers
}, { dark: false });

// Custom dark theme that matches the app's design
const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    height: '100%',
  },
  '.cm-content': {
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    fontSize: '14px',
    padding: '8px 0',
    caretColor: '#e5e5e5',
  },
  '.cm-line': {
    padding: '0 10px',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6e7681',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(59, 130, 246, 0.3) !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(59, 130, 246, 0.4) !important',
  },
  '.cm-cursor': {
    borderLeftColor: '#e5e5e5',
  },
  '.cm-placeholder': {
    color: '#6e7681',
    fontStyle: 'normal',
  },
}, { dark: true });

export function CodeEditor({
  value,
  onChange,
  placeholder = '',
  className,
  hasError = false,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  
  // Keep onChange ref updated
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!editorRef.current) return;

    // Detect dark mode
    const isDark = document.documentElement.classList.contains('dark');

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        // Use JSON language without closeBrackets extension (no auto-closing brackets/quotes)
        new LanguageSupport(jsonLanguage),
        isDark ? [oneDark, darkTheme] : lightTheme,
        placeholderExt(placeholder),
        updateListener,
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  // Update value from outside
  useEffect(() => {
    const view = viewRef.current;
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div
      ref={editorRef}
      className={cn(
        'h-full overflow-auto rounded-md border bg-transparent',
        hasError ? 'border-destructive' : 'border-input',
        className
      )}
    />
  );
}
