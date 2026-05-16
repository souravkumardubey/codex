'use client';

import { useEffect, useRef } from 'react';
import { Terminal, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TestResult } from '@/types';

interface OutputTerminalProps {
  stdout: string;
  stderr: string;
  isRunning: boolean;
  runtime?: number;
  memoryUsed?: number;
  exitCode?: number;
  error?: string;
  testResults?: TestResult[];
  className?: string;
}

export function OutputTerminal({
  stdout,
  stderr,
  isRunning,
  runtime,
  memoryUsed,
  exitCode,
  error,
  testResults,
  className,
}: OutputTerminalProps) {
  const terminalRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [stdout, stderr]);

  const isCompileError = error === 'COMPILATION_ERROR';

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4" />
          <span className="text-sm font-medium">Output</span>
        </div>
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          {isRunning && (
            <span className="flex items-center text-primary">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Running...
            </span>
          )}
          {isCompileError && (
            <span className="flex items-center text-red-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Compilation Error
            </span>
          )}
          {testResults && !isRunning && !isCompileError && (
            <span className={cn('flex items-center', testResults.every(t => t.passed) ? 'text-green-500' : 'text-red-500')}>
              {testResults.every(t => t.passed) ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {testResults.filter(t => t.passed).length}/{testResults.length} passed
            </span>
          )}
          {runtime !== undefined && !isRunning && (
            <span>
              Runtime: {runtime.toFixed(0)}ms
            </span>
          )}
          {memoryUsed !== undefined && !isRunning && (
            <span>
              Memory: {(memoryUsed / 1024).toFixed(1)}MB
            </span>
          )}
        </div>
      </div>

      {/* Test Results */}
      {testResults && testResults.length > 0 && !isRunning && (
        <div className="border-b bg-muted/30">
          {testResults.map((tr, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 text-xs border-b last:border-b-0',
                tr.passed ? 'bg-green-500/5' : 'bg-red-500/5',
              )}
            >
              {tr.passed ? (
                <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500 shrink-0" />
              )}
              <span className="font-medium shrink-0">Test {i + 1}:</span>
              {tr.hidden ? (
                <span className="text-muted-foreground italic">Hidden test case</span>
              ) : (
                <>
                  <span className="text-muted-foreground">
                    Input: <code className="text-foreground">{tr.input}</code>
                  </span>
                  <span className="text-muted-foreground">
                    Expected: <code className="text-foreground">{tr.expectedOutput}</code>
                  </span>
                  <span className="text-muted-foreground">
                    Got: <code className={tr.passed ? 'text-green-500' : 'text-red-500'}>{tr.actualOutput}</code>
                  </span>
                </>
              )}
              <span className="text-muted-foreground ml-auto">{tr.runtime}ms</span>
            </div>
          ))}
        </div>
      )}

      {isCompileError && stderr && (
        <div className="border-b bg-red-500/5 px-4 py-2">
          <div className="text-xs font-medium text-red-500 mb-1">Compilation Error:</div>
          <pre className="text-xs text-red-400 whitespace-pre-wrap font-mono">{stderr}</pre>
        </div>
      )}

      {/* Stdout / Stderr */}
      <pre
        ref={terminalRef}
        className="flex-1 p-4 font-mono text-sm overflow-auto bg-black/5 dark:bg-black/20"
      >
        {stdout && (
          <div className="text-foreground">{stdout}</div>
        )}
        {stderr && !isCompileError && (
          <div className="text-red-500">{stderr}</div>
        )}
        {!stdout && !stderr && !isRunning && !testResults && (
          <span className="text-muted-foreground">
            Run your code to see output here...
          </span>
        )}
        {isRunning && !stdout && !stderr && (
          <span className="text-muted-foreground animate-pulse">
            Waiting for output...
          </span>
        )}
      </pre>
    </div>
  );
}
