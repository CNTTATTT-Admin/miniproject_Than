import { CardObjType } from "@crema/types/models/apps/ScrumbBoard";

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'CARD_CREATED' | 'CARD_DELETED' | 'CARD_UPDATED' | 'CARD_MOVED';
  boardId: string;
  cardId: string;
  data?: CardObjType;
  fromListId?: string;
  toListId?: string;
  timestamp: string;
}

// WebSocket Connection Status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// WebSocket Event Handlers
export interface WebSocketHandlers {
  onCardCreated?: (message: WebSocketMessage) => void;
  onCardDeleted?: (message: WebSocketMessage) => void;
  onCardUpdated?: (message: WebSocketMessage) => void;
  onCardMoved?: (message: WebSocketMessage) => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private boardId: string | null = null;
  private handlers: WebSocketHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second
  private reconnectTimer: NodeJS.Timeout | null = null;
  private status: ConnectionStatus = 'disconnected';
  private processedMessages: Set<string> = new Set();
  private maxProcessedMessages = 100; // Keep only last 100 messages

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
    
    // Listen for page visibility changes and online/offline events
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  // Connect to WebSocket for specific board
  connect(boardId: string, handlers: WebSocketHandlers = {}): void {
    // Check if already connected to the same board
    if (this.ws?.readyState === WebSocket.OPEN && this.boardId === boardId) {
      console.log('WebSocket already connected to board:', boardId);
      // Update handlers without reconnecting
      this.handlers = handlers;
      return;
    }

    // Check if connecting to the same board (avoid unnecessary reconnection)
    if (this.status === 'connecting' && this.boardId === boardId) {
      console.log('WebSocket already connecting to board:', boardId);
      this.handlers = handlers;
      return;
    }

    console.log('WebSocket: Starting new connection to board:', boardId);
    this.disconnect();
    this.boardId = boardId;
    this.handlers = handlers;
    this.status = 'connecting';
    this.reconnectAttempts = 0; // Reset attempts for new connection
    this.notifyStatusChange();

    try {
      const wsUrl = `ws://localhost:8081/ws/board/${boardId}`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.status = 'error';
      this.notifyStatusChange();
      this.scheduleReconnect();
    }
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect'); // Normal closure
      this.ws = null;
    }

    this.boardId = null;
    this.handlers = {};
    this.reconnectAttempts = 0;
    this.status = 'disconnected';
    this.notifyStatusChange();
  }

  // Setup WebSocket event listeners
  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected to board:', this.boardId);
      this.status = 'connected';
      this.reconnectAttempts = 0;
      this.notifyStatusChange();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        
        // Check for duplicate messages
        if (this.isDuplicateMessage(message)) {
          console.log('Duplicate message ignored:', message.type, message.cardId);
          return;
        }
        
        this.markMessageAsProcessed(message);
        console.log('Processing WebSocket message:', message.type, message.cardId);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.status = 'disconnected';
      this.notifyStatusChange();
      
      // Only attempt reconnect if it wasn't a manual close and we have a boardId
      if (event.code !== 1000 && this.boardId) {
        console.log('WebSocket closed unexpectedly, scheduling reconnect...');
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.status = 'error';
      this.notifyStatusChange();
    };
  }

  // Check if message is duplicate
  private isDuplicateMessage(message: WebSocketMessage): boolean {
    const messageId = this.getMessageId(message);
    return this.processedMessages.has(messageId);
  }

  // Mark message as processed
  private markMessageAsProcessed(message: WebSocketMessage): void {
    const messageId = this.getMessageId(message);
    this.processedMessages.add(messageId);
    
    // Cleanup old messages to prevent memory leak
    if (this.processedMessages.size > this.maxProcessedMessages) {
      const messagesArray = Array.from(this.processedMessages);
      const toRemove = messagesArray.slice(0, messagesArray.length - this.maxProcessedMessages);
      toRemove.forEach(id => this.processedMessages.delete(id));
    }
  }

  // Generate unique message ID with more precision
  private getMessageId(message: WebSocketMessage): string {
    // Include boardId, type, cardId, and timestamp for better uniqueness
    const baseId = `${message.boardId}-${message.type}-${message.cardId}-${message.timestamp}`;
    
    // For CARD_MOVED, include fromListId and toListId for better uniqueness
    if (message.type === 'CARD_MOVED' && message.fromListId && message.toListId) {
      return `${baseId}-${message.fromListId}-${message.toListId}`;
    }
    
    return baseId;
  }

  // Handle incoming WebSocket messages
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'CARD_CREATED':
        this.handlers.onCardCreated?.(message);
        break;
      case 'CARD_DELETED':
        this.handlers.onCardDeleted?.(message);
        break;
      case 'CARD_UPDATED':
        this.handlers.onCardUpdated?.(message);
        break;
      case 'CARD_MOVED':
        this.handlers.onCardMoved?.(message);
        break;
      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  // Schedule reconnection attempt
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      this.status = 'error';
      this.notifyStatusChange();
      return;
    }

    if (!this.boardId) return;

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      if (this.boardId && this.handlers) {
        console.log(`Reconnection attempt ${this.reconnectAttempts}`);
        this.connect(this.boardId, this.handlers);
      }
    }, delay);
  }

  // Handle page visibility change
  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Page is hidden, disconnect to save resources
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.close(1000, 'Page hidden');
      }
    } else {
      // Page is visible, reconnect if needed
      if (this.boardId && this.status === 'disconnected') {
        console.log('Page visible, attempting to reconnect...');
        this.connect(this.boardId, this.handlers);
      }
    }
  }

  // Handle online event
  private handleOnline(): void {
    console.log('Network is online, attempting to reconnect...');
    if (this.boardId && this.status === 'disconnected') {
      this.connect(this.boardId, this.handlers);
    }
  }

  // Handle offline event
  private handleOffline(): void {
    console.log('Network is offline');
    this.status = 'disconnected';
    this.notifyStatusChange();
  }

  // Notify status change
  private notifyStatusChange(): void {
    this.handlers.onConnectionStatusChange?.(this.status);
  }

  // Get current connection status
  getStatus(): ConnectionStatus {
    return this.status;
  }

  // Check if connected
  isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  // Send message (if needed for future features)
  send(message: any): void {
    if (this.isConnected() && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.processedMessages.clear();
    
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
