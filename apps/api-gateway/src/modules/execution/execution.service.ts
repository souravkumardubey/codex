import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { getDatabase } from '@codex/database';
import { addExecutionJob } from '@codex/queue';
import { CreateExecutionDto } from './dto/execution.dto';
import { EXECUTION_EVENTS } from '@codex/shared';
import type { QueueJobData } from '@codex/shared';

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  async createExecution(
    userId: string | undefined,
    dto: CreateExecutionDto,
  ) {
    const db = getDatabase();

    const execution = await db.execution.create({
      data: {
        userId: userId || null,
        language: dto.language,
        sourceCode: dto.sourceCode,
        stdin: dto.stdin || '',
        status: 'PENDING',
      },
    });

    const jobData: QueueJobData = {
      executionId: execution.id,
      language: dto.language,
      sourceCode: dto.sourceCode,
      stdin: dto.stdin || '',
      testCases: dto.testCases?.map((tc) => ({
        input: tc.input || '',
        expectedOutput: tc.expectedOutput,
        hidden: tc.hidden,
      })),
      userId,
      timestamp: Date.now(),
    };

    await addExecutionJob(jobData);

    await db.execution.update({
      where: { id: execution.id },
      data: { status: 'QUEUED' },
    });

    this.logger.log(`Execution ${execution.id} created and queued`);

    return this.getExecutionById(execution.id);
  }

  async getExecutionById(executionId: string) {
    const db = getDatabase();
    const execution = await db.execution.findUnique({
      where: { id: executionId },
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    return execution;
  }

  async getExecutions(
    userId?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const db = getDatabase();
    const skip = (page - 1) * limit;

    const where = userId ? { userId } : {};

    const [data, total] = await Promise.all([
      db.execution.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          language: true,
          status: true,
          runtime: true,
          memoryUsed: true,
          exitCode: true,
          createdAt: true,
          userId: true,
        },
      }),
      db.execution.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async submitWithTestCases(
    userId: string,
    challengeId: string,
    dto: CreateExecutionDto,
  ) {
    const db = getDatabase();

    const challenge = await db.challenge.findUnique({
      where: { id: challengeId },
      include: { testCases: true },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const execution = await db.execution.create({
      data: {
        userId,
        language: dto.language,
        sourceCode: dto.sourceCode,
        stdin: dto.stdin || '',
        status: 'PENDING',
      },
    });

    const jobData: QueueJobData = {
      executionId: execution.id,
      language: dto.language,
      sourceCode: dto.sourceCode,
      stdin: dto.stdin || '',
      testCases: challenge.testCases.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        hidden: tc.hidden,
      })),
      userId,
      timestamp: Date.now(),
    };

    await addExecutionJob(jobData);

    await db.execution.update({
      where: { id: execution.id },
      data: { status: 'QUEUED' },
    });

    // Create submission record
    const submission = await db.submission.create({
      data: {
        userId,
        challengeId,
        executionId: execution.id,
        code: dto.sourceCode,
        language: dto.language,
        status: 'PENDING',
      },
    });

    this.logger.log(`Submission ${submission.id} created for challenge ${challengeId}`);

    return { execution, submission };
  }

  async getExecutionMetrics() {
    const db = getDatabase();
    const [total, completed, failed, timeout, avgRuntime] = await Promise.all([
      db.execution.count(),
      db.execution.count({ where: { status: 'COMPLETED' } }),
      db.execution.count({ where: { status: 'FAILED' } }),
      db.execution.count({ where: { status: 'TIMEOUT' } }),
      db.execution.aggregate({
        _avg: { runtime: true },
      }),
    ]);

    return {
      total,
      completed,
      failed,
      timeout,
      avgRuntime: avgRuntime._avg.runtime || 0,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}
