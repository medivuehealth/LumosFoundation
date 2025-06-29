import config from '../config';

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs in memory
  }

  formatMessage(level, message, details = null) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  async saveLog(logEntry) {
    try {
      // Add to in-memory logs
      this.logs.push(logEntry);
      if (this.logs.length > this.maxLogs) {
        this.logs.shift(); // Remove oldest log
      }

      // Send to server
      await fetch(`${config.API_URL}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logEntry)
      });

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console[logEntry.level](
          `[${logEntry.timestamp}] ${logEntry.level.toUpperCase()}: ${logEntry.message}`,
          logEntry.details || ''
        );
      }
    } catch (error) {
      // Fallback to console if server logging fails
      console.error('Failed to save log:', error);
      console[logEntry.level](
        `[${logEntry.timestamp}] ${logEntry.level.toUpperCase()}: ${logEntry.message}`,
        logEntry.details || ''
      );
    }
  }

  error(message, error = null) {
    const details = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    } : null;
    
    const logEntry = this.formatMessage(LOG_LEVELS.ERROR, message, details);
    this.saveLog(logEntry);
  }

  warn(message, details = null) {
    const logEntry = this.formatMessage(LOG_LEVELS.WARN, message, details);
    this.saveLog(logEntry);
  }

  info(message, details = null) {
    const logEntry = this.formatMessage(LOG_LEVELS.INFO, message, details);
    this.saveLog(logEntry);
  }

  debug(message, details = null) {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = this.formatMessage(LOG_LEVELS.DEBUG, message, details);
      this.saveLog(logEntry);
    }
  }

  // Get recent logs with optional filtering
  getLogs(options = {}) {
    let filteredLogs = [...this.logs];
    
    if (options.level) {
      filteredLogs = filteredLogs.filter(log => log.level === options.level);
    }
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes(searchLower))
      );
    }
    
    if (options.startDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(options.startDate)
      );
    }
    
    if (options.endDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(options.endDate)
      );
    }
    
    return filteredLogs;
  }
}

export const logger = new Logger();
export default logger;

export const logToServer = async (level, message, details = {}) => {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    await fetch(`${config.API_URL}/api/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logEntry)
    });
  } catch (error) {
    console.error('Failed to send log to server:', error);
  }
}; 