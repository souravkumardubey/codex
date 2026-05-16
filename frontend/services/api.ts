import axios, { AxiosInstance, AxiosError } from 'axios';
import { AuthResponse, PaginatedResponse, Execution, Challenge, Submission, UserStats, TestResult } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
              localStorage.setItem('accessToken', data.data.accessToken);
              localStorage.setItem('refreshToken', data.data.refreshToken);
              error.config!.headers.Authorization = `Bearer ${data.data.accessToken}`;
              return this.client(error.config!);
            } catch {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
            }
          }
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth
  async register(data: { email: string; username: string; password: string }) {
    const res = await this.client.post<{ data: AuthResponse }>('/auth/register', data);
    return res.data.data;
  }

  async login(data: { email: string; password: string }) {
    const res = await this.client.post<{ data: AuthResponse }>('/auth/login', data);
    return res.data.data;
  }

  async refresh(refreshToken: string) {
    const res = await this.client.post<{ data: AuthResponse }>('/auth/refresh', { refreshToken });
    return res.data.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
  }

  async getProfile() {
    const res = await this.client.get<{ data: any }>('/users/me');
    return res.data.data;
  }

  // Executions
  async createExecution(data: { language: string; sourceCode: string; stdin?: string }) {
    const res = await this.client.post<{ data: Execution }>('/executions', data);
    return res.data.data;
  }

  async createAnonymousExecution(data: { language: string; sourceCode: string; stdin?: string }) {
    const res = await this.client.post<{ data: Execution }>('/executions/anonymous', data);
    return res.data.data;
  }

  async getExecution(id: string) {
    const res = await this.client.get<{ data: Execution }>(`/executions/${id}`);
    return res.data.data;
  }

  async getExecutions(page = 1, limit = 20) {
    const res = await this.client.get<{ data: PaginatedResponse<Execution> }>(
      `/executions?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  }

  // Challenges
  async getChallenges(params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    tag?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.difficulty) searchParams.set('difficulty', params.difficulty);
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.search) searchParams.set('search', params.search);

    const res = await this.client.get<{ data: PaginatedResponse<Challenge> }>(
      `/challenges?${searchParams}`,
    );
    return res.data.data;
  }

  async getChallengeBySlug(slug: string) {
    const res = await this.client.get<{ data: Challenge }>(`/challenges/${slug}`);
    return res.data.data;
  }

  async submitChallenge(challengeId: string, data: { language: string; sourceCode: string }) {
    const res = await this.client.post<{ data: { execution: Execution; submission: Submission } }>(
      `/executions/challenge/${challengeId}`,
      data,
    );
    return res.data.data;
  }

  async getSubmissions(challengeId: string, page = 1, limit = 20) {
    const res = await this.client.get<{ data: PaginatedResponse<Submission> }>(
      `/challenges/by-id/${challengeId}/submissions?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  }

  async getLeaderboard(challengeId: string, page = 1, limit = 20) {
    const res = await this.client.get<{ data: PaginatedResponse<Submission> }>(
      `/challenges/by-id/${challengeId}/leaderboard?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  }

  // User
  async getUserStats() {
    const res = await this.client.get<{ data: UserStats }>('/users/me/stats');
    return res.data.data;
  }

  async getExecutionHistory(page = 1, limit = 20) {
    const res = await this.client.get<{ data: PaginatedResponse<Execution> }>(
      `/users/me/executions?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  }

  // Rooms
  async createRoom(data: { name: string; description?: string; language?: string }) {
    const res = await this.client.post<{ data: any }>('/rooms', data);
    return res.data.data;
  }

  async getRoom(id: string) {
    const res = await this.client.get<{ data: any }>(`/rooms/${id}`);
    return res.data.data;
  }
}

export const api = new ApiService();
