import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4002';

class SocketService {
  private socket: Socket | null = null;
  private executionSocket: Socket | null = null;
  private collaborationSocket: Socket | null = null;

  connect(token?: string) {
    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.executionSocket = io(`${WS_URL}/execution`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.collaborationSocket = io(`${WS_URL}/collaboration`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.executionSocket?.disconnect();
    this.collaborationSocket?.disconnect();
  }

  // Execution events
  subscribeToExecution(executionId: string) {
    this.executionSocket?.emit('subscribe', executionId);
  }

  unsubscribeFromExecution(executionId: string) {
    this.executionSocket?.emit('unsubscribe', executionId);
  }

  onExecutionQueued(callback: (data: any) => void) {
    this.executionSocket?.on('execution:queued', callback);
  }

  onExecutionStarted(callback: (data: any) => void) {
    this.executionSocket?.on('execution:started', callback);
  }

  onExecutionLog(callback: (data: { stream: string; data: string }) => void) {
    this.executionSocket?.on('execution:log', callback);
  }

  onExecutionCompleted(callback: (data: any) => void) {
    this.executionSocket?.on('execution:completed', callback);
  }

  onExecutionFailed(callback: (data: any) => void) {
    this.executionSocket?.on('execution:failed', callback);
  }

  onExecutionProgress(callback: (data: { progress: number }) => void) {
    this.executionSocket?.on('execution:progress', callback);
  }

  removeExecutionListeners() {
    this.executionSocket?.removeAllListeners();
  }

  // Collaboration events
  joinRoom(roomId: string, username: string) {
    this.collaborationSocket?.emit('room:join', { roomId, username });
  }

  leaveRoom() {
    this.collaborationSocket?.emit('room:leave');
  }

  sendCodeChange(code: string, language?: string) {
    this.collaborationSocket?.emit('code:change', { code, language });
  }

  sendCursorMove(line: number, column: number) {
    this.collaborationSocket?.emit('cursor:move', { line, column });
  }

  sendSelectionChange(selection: any) {
    this.collaborationSocket?.emit('selection:change', selection);
  }

  sendChatMessage(content: string) {
    this.collaborationSocket?.emit('chat:message', { content });
  }

  onRoomState(callback: (data: any) => void) {
    this.collaborationSocket?.on('room:state', callback);
  }

  onUserJoined(callback: (data: any) => void) {
    this.collaborationSocket?.on('user:joined', callback);
  }

  onUserLeft(callback: (data: any) => void) {
    this.collaborationSocket?.on('user:left', callback);
  }

  onCodeUpdate(callback: (data: { code: string; userId?: string }) => void) {
    this.collaborationSocket?.on('code:update', callback);
  }

  onCursorUpdate(callback: (data: any) => void) {
    this.collaborationSocket?.on('cursor:update', callback);
  }

  onSelectionUpdate(callback: (data: any) => void) {
    this.collaborationSocket?.on('selection:update', callback);
  }

  onChatMessage(callback: (data: any) => void) {
    this.collaborationSocket?.on('chat:message', callback);
  }

  removeCollaborationListeners() {
    this.collaborationSocket?.removeAllListeners();
  }
}

export const socketService = new SocketService();
