import { Server, Socket } from 'socket.io';
import { createLogger } from '@codex/logger';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('CollaborationGateway');

interface CollaborationRoom {
  id: string;
  users: Map<string, { id: string; username: string; color: string }>;
  code: string;
  language: string;
}

const rooms = new Map<string, CollaborationRoom>();
const userColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
];

export function setupCollaborationGateway(io: Server) {
  const collabNamespace = io.of('/collaboration');

  collabNamespace.on('connection', (socket: Socket) => {
    logger.debug(`Client connected to collaboration namespace: ${socket.id}`);

    // Join a collaboration room
    socket.on('room:join', (data: { roomId: string; username: string }) => {
      const { roomId, username } = data;
      const userId = (socket as any).user?.sub || uuidv4();

      let room = rooms.get(roomId);
      if (!room) {
        room = {
          id: roomId,
          users: new Map(),
          code: '',
          language: 'javascript',
        };
        rooms.set(roomId, room);
      }

      const colorIndex = room.users.size % userColors.length;
      const userInfo = {
        id: userId,
        username,
        color: userColors[colorIndex],
      };

      room.users.set(socket.id, userInfo);
      socket.join(`room:${roomId}`);
      (socket as any).roomId = roomId;

      // Send current state to the joining user
      socket.emit('room:state', {
        code: room.code,
        language: room.language,
        users: Array.from(room.users.values()),
      });

      // Notify others
      socket.to(`room:${roomId}`).emit('user:joined', userInfo);

      logger.debug({ roomId, userId, username }, 'User joined collaboration room');
    });

    // Leave a room
    socket.on('room:leave', () => {
      leaveRoom(socket);
    });

    // Code change event
    socket.on('code:change', (data: { code: string; language?: string }) => {
      const roomId = (socket as any).roomId;
      if (!roomId) return;

      const room = rooms.get(roomId);
      if (room) {
        room.code = data.code;
        if (data.language) {
          room.language = data.language;
        }
      }

      socket.to(`room:${roomId}`).emit('code:update', {
        code: data.code,
        userId: (socket as any).user?.sub,
        socketId: socket.id,
      });
    });

    // Cursor position
    socket.on('cursor:move', (data: { line: number; column: number }) => {
      const roomId = (socket as any).roomId;
      if (!roomId) return;

      socket.to(`room:${roomId}`).emit('cursor:update', {
        userId: (socket as any).user?.sub,
        socketId: socket.id,
        position: data,
        username: (socket as any).user?.email || 'Anonymous',
      });
    });

    // Selection change
    socket.on('selection:change', (data: any) => {
      const roomId = (socket as any).roomId;
      if (!roomId) return;

      socket.to(`room:${roomId}`).emit('selection:update', {
        userId: (socket as any).user?.sub,
        socketId: socket.id,
        selection: data,
      });
    });

    // Chat message
    socket.on('chat:message', (data: { content: string }) => {
      const roomId = (socket as any).roomId;
      if (!roomId) return;

      const message = {
        id: uuidv4(),
        userId: (socket as any).user?.sub,
        username: (socket as any).user?.email || 'Anonymous',
        content: data.content,
        timestamp: Date.now(),
      };

      io.to(`room:${roomId}`).emit('chat:message', message);
    });

    // Disconnect
    socket.on('disconnect', () => {
      leaveRoom(socket);
      logger.debug(`Client disconnected from collaboration namespace: ${socket.id}`);
    });
  });

  function leaveRoom(socket: Socket) {
    const roomId = (socket as any).roomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (room) {
      const userInfo = room.users.get(socket.id);
      room.users.delete(socket.id);

      // Clean up empty rooms
      if (room.users.size === 0) {
        rooms.delete(roomId);
        logger.debug({ roomId }, 'Collaboration room deleted');
      } else {
        socket.to(`room:${roomId}`).emit('user:left', {
          userId: userInfo?.id,
          socketId: socket.id,
        });
      }
    }

    socket.leave(`room:${roomId}`);
    (socket as any).roomId = null;
  }

  logger.info('Collaboration gateway initialized');
}
