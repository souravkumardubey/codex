import { Controller, Get } from '@nestjs/common';
import { getDatabase } from '@codex/database';
import { checkDockerAvailability } from '@codex/sandbox';
import { getQueueMetrics } from '@codex/queue';

@Controller('health')
export class HealthController {
  @Get()
  async check() {
    const start = Date.now();
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkDocker(),
      this.checkQueue(),
    ]);

    const status = {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - start,
      checks: {} as Record<string, any>,
    };

    const [db, docker, queue] = checks;

    status.checks.database = db.status === 'fulfilled' ? db.value : { status: 'error', error: db.reason?.message };
    status.checks.docker = docker.status === 'fulfilled' ? docker.value : { status: 'error', error: docker.reason?.message };
    status.checks.queue = queue.status === 'fulfilled' ? queue.value : { status: 'error', error: queue.reason?.message };

    const hasErrors = checks.some((c) => c.status === 'rejected');
    if (hasErrors) {
      status.status = 'degraded';
    }

    return status;
  }

  private async checkDatabase() {
    const db = getDatabase();
    await db.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  }

  private async checkDocker() {
    const available = await checkDockerAvailability();
    return { status: available ? 'ok' : 'unavailable' };
  }

  private async checkQueue() {
    const metrics = await getQueueMetrics();
    return { status: 'ok', metrics };
  }
}
