const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Configure winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // Write all logs to separate files
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Console output for development
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Log levels:
// error: 0
// warn: 1
// info: 2
// http: 3
// verbose: 4
// debug: 5
// silly: 6

const logError = (error, metadata = {}) => {
    logger.error({
        message: error.message || error,
        stack: error.stack,
        ...metadata
    });
};

const logWarning = (message, metadata = {}) => {
    logger.warn({
        message,
        ...metadata
    });
};

const logInfo = (message, metadata = {}) => {
    logger.info({
        message,
        ...metadata
    });
};

const logHttp = (req, res, responseTime) => {
    logger.http({
        method: req.method,
        url: req.url,
        status: res.statusCode,
        responseTime,
        userAgent: req.get('user-agent'),
        ip: req.ip
    });
};

const logDebug = (message, metadata = {}) => {
    logger.debug({
        message,
        ...metadata
    });
};

// Export logger functions
module.exports = {
    logError,
    logWarning,
    logInfo,
    logHttp,
    logDebug
}; 