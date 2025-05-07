import winston from 'winston';
import path from 'path';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'auth-service' },
  transports: [
    // Write logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join('logs', 'error.log'), 
      level: 'error' 
    }),
    
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: path.join('logs', 'combined.log') 
    }),
  ],
});

// If not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Helper functions for logging
export const logInfo = (message: string, meta?: any): void => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error | any): void => {
  if (error instanceof Error) {
    logger.error(`${message}: ${error.message}`, { 
      stack: error.stack,
      ...error
    });
  } else {
    logger.error(message, error);
  }
};

export const logWarn = (message: string, meta?: any): void => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any): void => {
  logger.debug(message, meta);
};

export default logger;