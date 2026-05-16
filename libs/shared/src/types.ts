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
