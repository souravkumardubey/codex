'use client';

import { useCallback, useRef } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface MonacoEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  go: 'go',
  java: 'java',
  cpp: 'cpp',
  rust: 'rust',
};

export function MonacoEditor({
  language,
  value,
  onChange,
  readOnly = false,
  height = '100%',
}: MonacoEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  const handleChange: OnChange = useCallback(
    (value) => {
      if (value !== undefined) {
        onChange(value);
      }
    },
    [onChange],
  );

  return (
    <Editor
      height={height}
      language={LANGUAGE_MAP[language] || 'javascript'}
      value={value}
      onChange={handleChange}
      onMount={handleEditorDidMount}
      theme={theme === 'dark' ? 'vs-dark' : 'vs'}
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        wordWrap: 'on',
        padding: { top: 16, bottom: 16 },
        automaticLayout: true,
        readOnly,
        bracketPairColorization: { enabled: true },
        tabSize: 2,
        formatOnPaste: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        folding: true,
        foldingHighlight: true,
        lineDecorationsWidth: 8,
        lineNumbersMinChars: 3,
        glyphMargin: false,
        renderWhitespace: 'selection',
      }}
    />
  );
}
