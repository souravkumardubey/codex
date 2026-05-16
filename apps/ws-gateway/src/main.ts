import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { createLogger } from '@codex/logger';
import { setupExecutionGateway } from './gateways/execution.gateway';
import { setupCollaborationGateway } from './gateways/collaboration.gateway';
import { verifyToken } from './config/auth';

const logger = createLogger('WS-Gateway');

async function bootstrap() {
  const port = parseInt(process.env.WS_PORT || '4002');

  const httpServer = createServer();

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
    transports: ['websocket', 'polling'],
    maxHttpBufferSize: 5e6, // 5MB max message size
  });

  // Redis adapter for multi-instance support
  try {
      const pubClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Redis adapter configured');
  } catch (error) {
    logger.warn('Redis adapter not available, running in single instance mode');
  }

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const user = verifyToken(token as string);
        (socket as any).user = user;
      } catch {
        // Allow unauthenticated connections for public streams
        logger.debug('Unauthenticated WebSocket connection');
      }
    }
    next();
  });

  // Connection logging
  io.on('connection', (socket) => {
    const user = (socket as any).user;
    logger.info(
      { userId: user?.sub || 'anonymous', socketId: socket.id },
      'WebSocket client connected',
    );

    socket.on('disconnect', (reason) => {
      logger.info(
        { socketId: socket.id, reason },
        'WebSocket client disconnected',
      );
    });

    socket.on('error', (error) => {
      logger.error({ socketId: socket.id, error: error.message }, 'WebSocket error');
    });
  });

  // Setup gateways
  setupExecutionGateway(io);
  setupCollaborationGateway(io);

  httpServer.listen(port, () => {
    logger.info(`WebSocket Gateway running on port ${port}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down WS Gateway...');
    io.close();
    httpServer.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((error) => {
  logger.error(error, 'Failed to start WS Gateway');
  process.exit(1);
});
