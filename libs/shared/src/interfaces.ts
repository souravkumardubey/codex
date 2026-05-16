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
