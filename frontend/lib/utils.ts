import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getLanguageExtension(language: string): string {
  const map: Record<string, string> = {
    python: 'py',
    javascript: 'js',
    typescript: 'ts',
    go: 'go',
    java: 'java',
    cpp: 'cpp',
    rust: 'rs',
  };
  return map[language] || 'txt';
}

export function getLanguageName(language: string): string {
  const map: Record<string, string> = {
    python: 'Python',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    go: 'Go',
    java: 'Java',
    cpp: 'C++',
    rust: 'Rust',
  };
  return map[language] || language;
}

export const LANGUAGE_VERSIONS: Record<string, string> = {
  python: '3.12',
  javascript: 'Node.js 20',
  typescript: 'TypeScript 5.4',
  go: 'Go 1.22',
  java: 'Java 21',
  cpp: 'C++23',
  rust: 'Rust 1.77',
};
