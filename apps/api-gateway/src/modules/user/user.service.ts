import { Injectable, NotFoundException } from '@nestjs/common';
import { getDatabase } from '@codex/database';

@Injectable()
export class UserService {
  async getProfile(userId: string) {
    const db = getDatabase();
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            executions: true,
            submissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getExecutionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const db = getDatabase();
    const skip = (page - 1) * limit;

    const [executions, total] = await Promise.all([
      db.execution.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          language: true,
          status: true,
          runtime: true,
          memoryUsed: true,
          createdAt: true,
        },
      }),
      db.execution.count({ where: { userId } }),
    ]);

    return {
      data: executions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats(userId: string) {
    const db = getDatabase();
    const [totalExecutions, successfulExecutions, totalSubmissions, acceptedSubmissions] =
      await Promise.all([
        db.execution.count({ where: { userId } }),
        db.execution.count({
          where: { userId, status: 'COMPLETED' },
        }),
        db.submission.count({ where: { userId } }),
        db.submission.count({
          where: { userId, status: 'ACCEPTED' },
        }),
      ]);

    return {
      totalExecutions,
      successfulExecutions,
      successRate: totalExecutions > 0
        ? Math.round((successfulExecutions / totalExecutions) * 100)
        : 0,
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate: totalSubmissions > 0
        ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
        : 0,
    };
  }
}
