'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { OutputTerminal } from '@/components/editor/OutputTerminal';
import { useEditorStore } from '@/store/editorStore';
import { api } from '@/services/api';
import { socketService } from '@/services/socket';
import { LANGUAGE_VERSIONS, getLanguageName } from '@/lib/utils';
import {
  Play,
  RotateCcw,
  Loader2,
  ChevronDown,
  Terminal,
  TestTube,
  SplitSquareVertical,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { TestResult } from '@/types';

const LANGUAGES = Object.keys(LANGUAGE_VERSIONS);

export default function PlaygroundPage() {
  const {
    language,
    code,
    stdin,
    stdout,
    stderr,
    isRunning,
    executionResult,
    testResults,
    setLanguage,
    setCode,
    setStdin,
    setStdout,
    setStderr,
    setIsRunning,
    setExecutionResult,
    setTestResults,
    reset,
  } = useEditorStore();

  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'output' | 'stdin' | 'tests'>('output');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const handleRun = useCallback(async () => {
    reset();
    setIsRunning(true);

    try {
      const execution = isAuthenticated
        ? await api.createExecution({ language, sourceCode: code, stdin })
        : await api.createAnonymousExecution({ language, sourceCode: code, stdin });

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const result = await api.getExecution(execution.id);
          if (result.status === 'COMPLETED' || result.status === 'FAILED' || result.status === 'TIMEOUT') {
            clearInterval(pollInterval);
            setStdout(result.stdout || '');
            setStderr(result.stderr || '');
            setExecutionResult(result);
            setIsRunning(false);

            if (result.status === 'COMPLETED') {
              toast.success('Execution completed');
            } else if (result.status === 'TIMEOUT') {
              toast.error('Execution timed out');
            } else {
              toast.error('Execution failed');
            }
          }
        } catch {
          clearInterval(pollInterval);
          setIsRunning(false);
          toast.error('Failed to get execution result');
        }
      }, 1000);

      // Cleanup after timeout
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isRunning) {
          setIsRunning(false);
          toast.error('Execution timed out');
        }
      }, 60000);
    } catch (error: any) {
      setIsRunning(false);
      toast.error(error.response?.data?.message?.[0] || 'Execution failed');
    }
  }, [language, code, stdin, isAuthenticated, reset, setIsRunning, setStdout, setStderr, setExecutionResult]);

  const handleReset = useCallback(() => {
    reset();
    setActiveTab('output');
    toast.success('Editor reset');
  }, [reset]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <div className="flex items-center space-x-2">
          {/* Language selector */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLanguagePicker(!showLanguagePicker)}
              className="w-36 justify-between"
            >
              <span>{getLanguageName(language)}</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            {showLanguagePicker && (
              <Card className="absolute top-full left-0 mt-1 z-50 w-48 p-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
                      lang === language ? 'bg-accent font-medium' : ''
                    }`}
                    onClick={() => {
                      setLanguage(lang);
                      setShowLanguagePicker(false);
                    }}
                  >
                    <div className="font-medium">{getLanguageName(lang)}</div>
                    <div className="text-xs text-muted-foreground">{LANGUAGE_VERSIONS[lang]}</div>
                  </button>
                ))}
              </Card>
            )}
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Run button */}
          <Button
            size="sm"
            onClick={handleRun}
            disabled={isRunning || !code.trim()}
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            Run
          </Button>

          {/* Reset button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isRunning}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        {/* Execution metadata */}
        {executionResult && (
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>Runtime: {executionResult.runtime?.toFixed(0)}ms</span>
            <span>Memory: {((executionResult.memoryUsed || 0) / 1024).toFixed(1)}MB</span>
            <span className={executionResult.exitCode === 0 ? 'text-green-500' : 'text-red-500'}>
              Exit: {executionResult.exitCode}
            </span>
          </div>
        )}
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 min-w-0">
          <MonacoEditor
            language={language}
            value={code}
            onChange={setCode}
          />
        </div>

        {/* Output panel */}
        <div className="w-[500px] border-l flex flex-col">
          {/* Tabs */}
          <div className="flex border-b bg-muted/30">
            {[
              { id: 'output', label: 'Output', icon: Terminal },
              { id: 'stdin', label: 'Stdin', icon: TestTube },
              { id: 'tests', label: 'Tests', icon: SplitSquareVertical },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'output' && (
              <OutputTerminal
                stdout={stdout}
                stderr={stderr}
                isRunning={isRunning}
                runtime={executionResult?.runtime}
                memoryUsed={executionResult?.memoryUsed}
                exitCode={executionResult?.exitCode}
                className="h-full"
              />
            )}

            {activeTab === 'stdin' && (
              <div className="p-4 h-full">
                <label className="text-sm font-medium mb-2 block">Standard Input</label>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter input for your program..."
                  className="w-full h-[calc(100%-2rem)] p-3 rounded-md border bg-background font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="p-4 h-full overflow-auto">
                {testResults && testResults.length > 0 ? (
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-md border ${
                          result.passed
                            ? 'border-green-500/30 bg-green-500/5'
                            : 'border-red-500/30 bg-red-500/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">Test {index + 1}</span>
                          <span className={result.passed ? 'text-green-500' : 'text-red-500'}>
                            {result.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs font-mono">
                          <div>
                            <span className="text-muted-foreground">Expected: </span>
                            {result.expectedOutput}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Got: </span>
                            {result.actualOutput || '(empty)'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Submit a challenge to see test results here.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
