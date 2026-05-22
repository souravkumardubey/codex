import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  get port(): number {
    return parseInt(process.env.PORT || '4000');
  }

  get jwtSecret(): string {
    return process.env.JWT_SECRET || 'super-secret-key';
  }

  get jwtExpiration(): string {
    return process.env.JWT_EXPIRATION || '15m';
  }

  get jwtRefreshExpiration(): string {
    return process.env.JWT_REFRESH_EXPIRATION || '7d';
  }

  get corsOrigin(): string | string[] {
    const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    return origin.includes(',') ? origin.split(',').map((s) => s.trim()) : origin;
  }

  get databaseUrl(): string {
    return (
      process.env.DATABASE_URL ||
      'postgresql://codex:codex123@localhost:5432/codex?schema=public'
    );
  }

  get redisUrl(): string {
    return process.env.REDIS_URL || 'redis://localhost:6379';
  }

  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get rateLimit(): { ttl: number; max: number } {
    return {
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60'),
      max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    };
  }
}
