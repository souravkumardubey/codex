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
  python: { image: 'codex-python:latest', runCommand: 'python3 /code/main.py', extension: '.py', memoryLimit: '256m', cpuLimit: 0.5, timeout: 10000 },
  javascript: { image: 'codex-node:latest', runCommand: 'node /code/main.js', extension: '.js', memoryLimit: '256m', cpuLimit: 0.5, timeout: 10000 },
  typescript: { image: 'codex-node:latest', compileCommand: 'tsc --outDir /code --rootDir /code /code/main.ts --module commonjs --moduleResolution node --target ES2020 --skipLibCheck --declaration false --sourceMap false --esModuleInterop --strict', runCommand: 'node /code/main.js', extension: '.ts', memoryLimit: '256m', cpuLimit: 0.5, timeout: 15000 },
  go: { image: 'codex-go:latest', compileCommand: 'go build -o /code/main /code/main.go', runCommand: '/code/main', extension: '.go', memoryLimit: '256m', cpuLimit: 0.5, timeout: 15000 },
  java: { image: 'codex-java:latest', compileCommand: 'javac /code/Main.java -d /code', runCommand: 'java -cp /code Main', extension: '.java', memoryLimit: '512m', cpuLimit: 1, timeout: 20000 },
  cpp: { image: 'codex-cpp:latest', compileCommand: 'g++ -o /code/main /code/main.cpp -std=c++17 -O2', runCommand: '/code/main', extension: '.cpp', memoryLimit: '256m', cpuLimit: 0.5, timeout: 15000 },
  rust: { image: 'codex-rust:latest', compileCommand: 'rustc -o /code/main /code/main.rs', runCommand: '/code/main', extension: '.rs', memoryLimit: '512m', cpuLimit: 1, timeout: 20000 },
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

export interface ExecutionRequest {
  userId?: string;
  language: string;
  sourceCode: string;
  stdin?: string;
  testCases?: TestCase[];
}

export interface ExecutionResult {
  executionId: string;
  stdout: string;
  stderr: string;
  runtime: number;
  memoryUsed: number;
  exitCode: number;
  status: string;
  error?: string;
  testResults?: TestResult[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  hidden?: boolean;
}

export interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  runtime: number;
  hidden?: boolean;
}

export interface WorkerJob {
  executionId: string;
  userId?: string;
  language: string;
  sourceCode: string;
  stdin: string;
  testCases?: TestCase[];
  timestamp: number;
}

export interface WorkerHeartbeat {
  workerId: string;
  status: 'idle' | 'busy';
  currentJobs: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: number;
}

export interface WSEvent {
  event: string;
  data: any;
  room?: string;
}

export interface CollaborationEvent {
  type: 'cursor' | 'code' | 'selection' | 'presence';
  userId: string;
  username: string;
  data: any;
  timestamp: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface LanguageConfig {
  image: string;
  compileCommand?: string;
  runCommand: string;
  extension: string;
  memoryLimit: string;
  cpuLimit: number;
  timeout: number;
}

export interface ExecutionMetrics {
  runtime: number;
  memoryUsed: number;
  cpuUsage: number;
  timestamp: number;
}

export interface SandboxConfig {
  memoryLimit: string;
  cpuLimit: number;
  timeout: number;
  disableNetwork: boolean;
  readOnlyFS: boolean;
  removeAfter: boolean;
}

export interface QueueJobData {
  executionId: string;
  language: string;
  sourceCode: string;
  stdin: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    hidden?: boolean;
  }>;
  userId?: string;
  timestamp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  avatarUrl: string | null;
  createdAt: Date;
}
