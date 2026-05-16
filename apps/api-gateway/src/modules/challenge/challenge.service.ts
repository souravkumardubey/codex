import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { getDatabase } from '@codex/database';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChallengeService {
  private readonly logger = new Logger(ChallengeService.name);

  async getAllChallenges(params: {
    page?: number;
    limit?: number;
    difficulty?: string;
    tag?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const db = getDatabase();
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ChallengeWhereInput = {
      isActive: true,
    };

    if (params.difficulty) {
      where.difficulty = params.difficulty as any;
    }

    if (params.tag) {
      where.tags = { has: params.tag };
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ChallengeOrderByWithRelationInput = {};
    if (params.sortBy) {
      orderBy[params.sortBy as keyof Prisma.ChallengeOrderByWithRelationInput] =
        params.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      db.challenge.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          tags: true,
          popularity: true,
          createdAt: true,
          _count: {
            select: { submissions: true, testCases: true },
          },
        },
      }),
      db.challenge.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getChallengeBySlug(slug: string) {
    const db = getDatabase();
    const challenge = await db.challenge.findUnique({
      where: { slug },
      include: {
        testCases: {
          where: { hidden: false },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            input: true,
            expectedOutput: true,
            order: true,
          },
        },
        _count: {
          select: { submissions: true },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    return challenge;
  }

  async getChallengeById(id: string) {
    const db = getDatabase();
    const challenge = await db.challenge.findUnique({
      where: { id },
      include: {
        testCases: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            input: true,
            expectedOutput: true,
            hidden: true,
            order: true,
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    return challenge;
  }

  async getSubmissions(
    challengeId: string,
    userId?: string,
    page?: number,
    limit?: number,
  ) {
    const db = getDatabase();
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;

    const where: Prisma.SubmissionWhereInput = { challengeId };
    if (userId) {
      where.userId = userId;
    }

    const [data, total] = await Promise.all([
      db.submission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
        include: {
          user: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
      }),
      db.submission.count({ where }),
    ]);

    return {
      data,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async getLeaderboard(
    challengeId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const db = getDatabase();
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      db.submission.findMany({
        where: {
          challengeId,
          status: 'ACCEPTED',
        },
        orderBy: [
          { runtime: 'asc' },
          { memory: 'asc' },
          { createdAt: 'asc' },
        ],
        skip,
        take: limit,
        select: {
          id: true,
          score: true,
          runtime: true,
          memory: true,
          language: true,
          createdAt: true,
          user: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
      }),
      db.submission.count({
        where: { challengeId, status: 'ACCEPTED' },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
