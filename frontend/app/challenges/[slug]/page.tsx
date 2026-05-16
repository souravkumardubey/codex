'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { OutputTerminal } from '@/components/editor/OutputTerminal';
import { api } from '@/services/api';
import { useEditorStore } from '@/store/editorStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Trophy,
  Clock,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { LANGUAGE_VERSIONS, getLanguageName, formatTime } from '@/lib/utils';

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'text-green-500 bg-green-500/10',
  MEDIUM: 'text-yellow-500 bg-yellow-500/10',
  HARD: 'text-red-500 bg-red-500/10',
  EXPERT: 'text-purple-500 bg-purple-500/10',
};

const LANGUAGES = Object.keys(LANGUAGE_VERSIONS);

export default function ChallengeDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuthStore();
  const {
    language,
    code,
    setLanguage,
    setCode,
    stdout,
    stderr,
    isRunning,
    executionResult,
    testResults,
    setStdout,
    setStderr,
    setIsRunning,
    setExecutionResult,
    setTestResults,
    reset,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'description' | 'solutions'>('description');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', slug],
    queryFn: () => api.getChallengeBySlug(slug),
  });

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to submit solutions');
      return;
    }
    if (!challenge) return;

    reset();
    setIsRunning(true);

    try {
      const { submission } = await api.submitChallenge(challenge.id, {
        language,
        sourceCode: code,
      });

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const exec = await api.getExecution(submission.executionId);
          if (exec.status === 'COMPLETED' || exec.status === 'FAILED' || exec.status === 'TIMEOUT') {
            clearInterval(pollInterval);
            setStdout(exec.stdout || '');
            setStderr(exec.stderr || '');
            setExecutionResult(exec);
            setTestResults(exec.testResults || null);
            setIsRunning(false);

            if (exec.error === 'COMPILATION_ERROR') {
              toast.error('Compilation error');
            } else if (exec.status === 'TIMEOUT') {
              toast.error('Execution timed out');
            } else if (exec.status === 'FAILED') {
              toast.error('Execution failed');
            } else if (exec.testResults?.every(t => t.passed)) {
              toast.success('All tests passed!');
            } else {
              toast.error('Some tests failed');
            }
          }
        } catch {
          clearInterval(pollInterval);
          setIsRunning(false);
          toast.error('Failed to get results');
        }
      }, 1000);
    } catch (error: any) {
      setIsRunning(false);
      toast.error(error.response?.data?.message?.[0] || 'Submission failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Challenge not found</h2>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Left panel - Challenge description */}
      <div className="w-[45%] border-r overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">{challenge.title}</h1>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  DIFFICULTY_COLORS[challenge.difficulty],
                )}
              >
                {challenge.difficulty}
              </span>
            </div>
            {challenge.tags && (
              <div className="flex gap-2">
                {challenge.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: challenge.description.replace(/\n/g, '<br/>') }} />
          </div>

          {/* Examples */}
          {challenge.examples && challenge.examples.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Examples</h3>
              {challenge.examples.map((example: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4 space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Input: </span>
                      <code className="text-sm bg-muted px-2 py-0.5 rounded">{example.input}</code>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Output: </span>
                      <code className="text-sm bg-muted px-2 py-0.5 rounded">{example.output}</code>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Constraints */}
          {challenge.constraints && (
            <div>
              <h3 className="font-semibold mb-2">Constraints</h3>
              <p className="text-sm text-muted-foreground">{challenge.constraints}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right panel - Code editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
          <div className="flex items-center space-x-2">
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
                      {getLanguageName(lang)}
                    </button>
                  ))}
                </Card>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success('Code reset to template')}
            >
              Reset
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={isRunning || !isAuthenticated}>
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Play className="h-4 w-4 mr-1" />
              )}
              Submit
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <MonacoEditor
            language={language}
            value={code}
            onChange={setCode}
          />
        </div>

        {/* Output */}
        <div className="h-48 border-t">
          <OutputTerminal
            stdout={stdout}
            stderr={stderr}
            isRunning={isRunning}
            runtime={executionResult?.runtime}
            memoryUsed={executionResult?.memoryUsed}
            exitCode={executionResult?.exitCode}
            error={executionResult?.error}
            testResults={testResults || undefined}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
