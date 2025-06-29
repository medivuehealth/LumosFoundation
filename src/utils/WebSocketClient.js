import config from '../config';
import { logger } from './logger';

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.listeners = new Set();
  }

  connect() {
    if (this.socket) {
      return;
    }

    try {
      this.socket = new WebSocket(`ws://${window.location.hostname}:3002/ws`);
      
      this.socket.onopen = () => {
        logger.info('WebSocket connection established');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.notifyListeners({ type: 'connection', status: 'connected' });
      };

      this.socket.onclose = () => {
        logger.warn('WebSocket connection closed');
        this.isConnected = false;
        this.socket = null;
        this.notifyListeners({ type: 'connection', status: 'disconnected' });
        this.scheduleReconnect();
      };

      this.socket.onerror = (error) => {
        logger.error('WebSocket error:', error);
        this.notifyListeners({ type: 'error', error });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners({ type: 'message', data });
        } catch (error) {
          logger.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      logger.error('Error creating WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.warn('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.reconnectDelay *= 2; // Exponential backoff

    logger.info(`Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    setTimeout(() => this.connect(), this.reconnectDelay);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  send(data) {
    if (!this.isConnected) {
      logger.warn('Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      this.socket.send(JSON.stringify(data));
      return true;
    } catch (error) {
      logger.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Error in WebSocket listener:', error);
      }
    });
  }
}

export const webSocketClient = new WebSocketClient();
export default webSocketClient; 