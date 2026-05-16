import { createLogger } from '@codex/logger';
import { connectDatabase, disconnectDatabase } from '@codex/database';
import { createExecutionWorker, getQueueMetrics } from '@codex/queue';
import { processExecutionJob } from './executor/executor';
import { checkDockerAvailability } from '@codex/sandbox';

const logger = createLogger('Worker');

let isShuttingDown = false;

async function bootstrap() {
  logger.info('Worker service starting...');

  // Check Docker availability
  const dockerAvailable = await checkDockerAvailability();
  if (!dockerAvailable) {
    logger.error('Docker is not available. Worker cannot function.');
    process.exit(1);
  }
  logger.info('Docker is available');

  // Connect to database
  await connectDatabase();
  logger.info('Database connected');

  // Create worker
  const worker = createExecutionWorker(async (job) => {
    if (isShuttingDown) {
      throw new Error('Worker is shutting down');
    }
    await processExecutionJob(job);
  });

  logger.info('Worker started and listening for jobs');

  // Report metrics periodically
  const metricsInterval = setInterval(async () => {
    try {
      const metrics = await getQueueMetrics();
      logger.info({ metrics }, 'Queue metrics');
    } catch (error) {
      logger.error(error, 'Failed to get queue metrics');
    }
  }, 30000);

  // Graceful shutdown
  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info('Shutting down worker...');
    clearInterval(metricsInterval);
    await worker.close();
    await disconnectDatabase();
    logger.info('Worker shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('uncaughtException', (error) => {
    logger.error(error, 'Uncaught exception');
    shutdown();
  });
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled rejection');
  });
}

bootstrap().catch((error) => {
  logger.error(error, 'Failed to start worker');
  process.exit(1);
});
