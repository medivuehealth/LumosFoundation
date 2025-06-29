import { logger } from './logger';
import config from '../config';

class BackgroundMonitor {
  constructor() {
    this.isRunning = false;
    this.pollInterval = 60000; // 1 minute
    this.errorThreshold = 3; // Number of errors before showing notification
    this.recentErrors = new Map(); // Track recent errors
    this.errorCount = 0;
    this.listeners = new Set();
    this.lastCheckTime = new Date().toISOString();
    this.connectionRetries = 0;
    this.maxRetries = 5;
    this.retryDelay = 60000; // Start with 1 minute
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.connectionRetries = 0;
    this.poll();
    
    // Also listen for unhandled errors
    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    
    logger.info('Background monitor started');
  }

  stop() {
    this.isRunning = false;
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    logger.info('Background monitor stopped');
  }

  handleGlobalError = (event) => {
    this.handleError({
      type: 'runtime',
      message: event.message,
      stack: event.error?.stack,
      location: `${event.filename}:${event.lineno}:${event.colno}`
    });
  }

  handleUnhandledRejection = (event) => {
    this.handleError({
      type: 'promise',
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      reason: event.reason
    });
  }

  async poll() {
    if (!this.isRunning) return;

    try {
      // Check server health first
      const healthCheck = await fetch(`${config.API_URL}/api/health`);
      if (!healthCheck.ok) {
        throw new Error('Server health check failed');
      }

      const response = await fetch(`${config.API_URL}/api/logs?level=error&startDate=${this.lastCheckTime}`);
      if (!response.ok) throw new Error('Failed to fetch logs');
      
      const logs = await response.json();
      this.processNewLogs(logs);
      
      // Reset connection retries on successful connection
      this.connectionRetries = 0;
      this.retryDelay = 60000;
      this.lastCheckTime = new Date().toISOString();
    } catch (error) {
      console.error('Background monitor poll failed:', error);
      
      // Implement exponential backoff for retries
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        this.retryDelay *= 2; // Exponential backoff
        console.log(`Retrying connection in ${this.retryDelay}ms (attempt ${this.connectionRetries}/${this.maxRetries})`);
      } else {
        // After max retries, revert to normal polling interval
        this.retryDelay = this.pollInterval;
        console.log('Max retries reached, reverting to normal polling interval');
      }
    } finally {
      if (this.isRunning) {
        setTimeout(() => this.poll(), this.retryDelay);
      }
    }
  }

  processNewLogs(logs) {
    const newErrors = logs.filter(log => log.level === 'error');
    
    if (newErrors.length > 0) {
      this.errorCount += newErrors.length;
      
      // Group similar errors
      newErrors.forEach(error => {
        const key = error.message;
        if (!this.recentErrors.has(key)) {
          this.recentErrors.set(key, {
            count: 1,
            firstSeen: new Date(),
            lastSeen: new Date(),
            details: error
          });
        } else {
          const existing = this.recentErrors.get(key);
          existing.count++;
          existing.lastSeen = new Date();
        }
      });

      // Clean up old errors (older than 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      for (const [key, value] of this.recentErrors) {
        if (value.lastSeen < oneHourAgo) {
          this.recentErrors.delete(key);
        }
      }

      // Notify listeners
      this.notifyListeners({
        type: 'errors',
        count: this.errorCount,
        errors: Array.from(this.recentErrors.values())
      });

      // Show system notification if threshold exceeded
      if (this.errorCount >= this.errorThreshold) {
        this.showSystemNotification(
          'High Error Rate Detected',
          `${this.errorCount} errors in the last hour. Check system logs.`
        );
      }
    }
  }

  handleError(error) {
    logger.error(error.message, error);
    this.errorCount++;
    
    // Notify listeners immediately for critical errors
    this.notifyListeners({
      type: 'critical',
      error
    });
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(notification) {
    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in monitor listener:', error);
      }
    });
  }

  async showSystemNotification(title, body) {
    try {
      if (!("Notification" in window)) return;

      if (Notification.permission === "granted") {
        new Notification(title, { body });
      } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          new Notification(title, { body });
        }
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  getStats() {
    return {
      isRunning: this.isRunning,
      errorCount: this.errorCount,
      recentErrors: Array.from(this.recentErrors.values()),
      lastCheckTime: this.lastCheckTime
    };
  }
}

export const backgroundMonitor = new BackgroundMonitor();
export default backgroundMonitor; 