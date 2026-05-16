export const SUPPORTED_LANGUAGES = [
  'python',
  'javascript',
  'typescript',
  'go',
  'java',
  'cpp',
  'rust',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_CONFIG: Record<
  SupportedLanguage,
  {
    image: string;
    compileCommand?: string;
    runCommand: string;
    extension: string;
    memoryLimit: string;
    cpuLimit: number;
    timeout: number;
  }
> = {
  python: {
    image: 'codex-python:latest',
    runCommand: 'python3 /code/main.py',
    extension: '.py',
    memoryLimit: '256m',
    cpuLimit: 0.5,
    timeout: 10000,
  },
  javascript: {
    image: 'codex-node:latest',
    runCommand: 'node /code/main.js',
    extension: '.js',
    memoryLimit: '256m',
    cpuLimit: 0.5,
    timeout: 10000,
  },
  typescript: {
    image: 'codex-node:latest',
    compileCommand: 'npx ts-node --transpile-only /code/main.ts',
    runCommand: 'node /code/main.js',
    extension: '.ts',
    memoryLimit: '256m',
    cpuLimit: 0.5,
    timeout: 15000,
  },
  go: {
    image: 'codex-go:latest',
    compileCommand: 'go build -o /code/main /code/main.go',
    runCommand: '/code/main',
    extension: '.go',
    memoryLimit: '256m',
    cpuLimit: 0.5,
    timeout: 15000,
  },
  java: {
    image: 'codex-java:latest',
    compileCommand: 'javac /code/Main.java -d /code',
    runCommand: 'java -cp /code Main',
    extension: '.java',
    memoryLimit: '512m',
    cpuLimit: 1,
    timeout: 20000,
  },
  cpp: {
    image: 'codex-cpp:latest',
    compileCommand: 'g++ -o /code/main /code/main.cpp -std=c++17 -O2',
    runCommand: '/code/main',
    extension: '.cpp',
    memoryLimit: '256m',
    cpuLimit: 0.5,
    timeout: 15000,
  },
  rust: {
    image: 'codex-rust:latest',
    compileCommand: 'rustc -o /code/main /code/main.rs',
    runCommand: '/code/main',
    extension: '.rs',
    memoryLimit: '512m',
    cpuLimit: 1,
    timeout: 20000,
  },
};

export const EXECUTION_EVENTS = {
  QUEUED: 'execution:queued',
  STARTED: 'execution:started',
  LOG: 'execution:log',
  COMPLETED: 'execution:completed',
  FAILED: 'execution:failed',
  TIMEOUT: 'execution:timeout',
  PROGRESS: 'execution:progress',
} as const;

export const COLLABORATION_EVENTS = {
  CODE_CHANGE: 'collab:code-change',
  CURSOR_MOVE: 'collab:cursor-move',
  USER_JOIN: 'collab:user-join',
  USER_LEAVE: 'collab:user-leave',
  ROOM_CHAT: 'collab:room-chat',
  PRESENCE: 'collab:presence',
} as const;

export const QUEUE_NAMES = {
  EXECUTION: 'execution',
  EXECUTION_DLQ: 'execution-dlq',
} as const;

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const RATE_LIMIT = {
  TTL: 60,
  MAX_REQUESTS: 100,
} as const;
