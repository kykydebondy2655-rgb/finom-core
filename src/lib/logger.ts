/**
 * Centralized Logging Service for FINOM
 * Replaces console.log/error with a structured logging approach
 * Supports different log levels and can be extended for external logging services
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// In production, only show warnings and errors
const MIN_LOG_LEVEL: LogLevel = import.meta.env.PROD ? 'warn' : 'debug';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp}`;
    return `${prefix} - ${entry.message}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, context ?? '');
        break;
      case 'info':
        console.info(formattedMessage, context ?? '');
        break;
      case 'warn':
        console.warn(formattedMessage, context ?? '');
        break;
      case 'error':
        console.error(formattedMessage, context ?? '');
        break;
    }

    // Future: Send to external logging service in production
    // if (import.meta.env.PROD && level === 'error') {
    //   this.sendToExternalService(entry);
    // }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  // Convenience method for logging errors with Error objects
  logError(message: string, error: unknown, context?: Record<string, unknown>): void {
    const errorContext: Record<string, unknown> = {
      ...context,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    };
    this.error(message, errorContext);
  }
}

export const logger = new Logger();
export default logger;
