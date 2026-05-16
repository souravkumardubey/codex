export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Execution {
  id: string;
  userId?: string;
  language: string;
  sourceCode: string;
  stdin: string;
  stdout: string;
  stderr: string;
  runtime: number;
  memoryUsed: number;
  exitCode: number;
  status: ExecutionStatus;
  error?: string;
  createdAt: string;
  testResults?: TestResult[];
}

export type ExecutionStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'TIMEOUT'
  | 'CANCELLED';

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  description: string;
  constraints?: string;
  examples: Example[];
  tags: string[];
  popularity: number;
  createdAt: string;
  testCases: TestCase[];
  _count?: {
    submissions: number;
    testCases: number;
  };
}

export interface Example {
  input: string;
  output: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  hidden: boolean;
  order: number;
}

export interface Submission {
  id: string;
  userId: string;
  challengeId: string;
  executionId: string;
  code: string;
  language: string;
  score: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ERROR';
  runtime?: number;
  memory?: number;
  passedTests: number;
  totalTests: number;
  createdAt: string;
  user?: Pick<User, 'id' | 'username' | 'avatarUrl'>;
}

export interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  runtime: number;
  hidden?: boolean;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  code: string;
  language: string;
  isPrivate: boolean;
  inviteCode?: string;
  createdAt: string;
  participants: RoomParticipant[];
}

export interface RoomParticipant {
  id: string;
  userId: string;
  username: string;
  color: string;
  isOnline: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  message: string[];
  error: string;
  statusCode: number;
}

export interface UserStats {
  totalExecutions: number;
  successfulExecutions: number;
  successRate: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
}
