import { Server, Socket } from 'socket.io';
import { createLogger } from '@codex/logger';

const logger = createLogger('ExecutionGateway');

export function setupExecutionGateway(io: Server) {
  const executionNamespace = io.of('/execution');

  executionNamespace.on('connection', (socket: Socket) => {
    logger.debug(`Client connected to execution namespace: ${socket.id}`);

    // Subscribe to execution updates
    socket.on('subscribe', (executionId: string) => {
      socket.join(`execution:${executionId}`);
      logger.debug({ executionId, socketId: socket.id }, 'Subscribed to execution');
    });

    // Unsubscribe from execution updates
    socket.on('unsubscribe', (executionId: string) => {
      socket.leave(`execution:${executionId}`);
      logger.debug({ executionId, socketId: socket.id }, 'Unsubscribed from execution');
    });

    socket.on('disconnect', () => {
      logger.debug(`Client disconnected from execution namespace: ${socket.id}`);
    });
  });

  // Helper to emit execution events
  const emitExecutionEvent = {
    queued: (executionId: string, data: any) => {
      executionNamespace.to(`execution:${executionId}`).emit('execution:queued', data);
    },

    started: (executionId: string, data: any) => {
      executionNamespace.to(`execution:${executionId}`).emit('execution:started', data);
    },

    log: (executionId: string, data: { stream: string; data: string }) => {
      executionNamespace.to(`execution:${executionId}`).emit('execution:log', data);
    },

    completed: (executionId: string, data: any) => {
      executionNamespace.to(`execution:${executionId}`).emit('execution:completed', data);
    },

    failed: (executionId: string, data: any) => {
      executionNamespace.to(`execution:${executionId}`).emit('execution:failed', data);
    },

    progress: (executionId: string, data: { progress: number }) => {
      executionNamespace.to(`execution:${executionId}`).emit('execution:progress', data);
    },
  };

  // Expose emitter for other modules
  (executionNamespace as any).emitExecutionEvent = emitExecutionEvent;

  logger.info('Execution gateway initialized');
}

// Export for external use
export function getExecutionEmitter(io: Server) {
  const namespace = io.of('/execution');
  return (namespace as any).emitExecutionEvent;
}
