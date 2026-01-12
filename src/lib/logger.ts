/**
 * Centralized Logging Service for FINOM
 * Replaces direct console.log/error/warn calls with structured logging
 * 
 * In production, logs can be sent to external services (Sentry, LogRocket, etc.)
 * For now, it provides a consistent interface with better control
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  context?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Check if we're in development mode
const isDev = import.meta.env.DEV;

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? isDev,
      minLevel: config.minLevel ?? (isDev ? 'debug' : 'warn'),
      context: config.context,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = entry.context ? `[${entry.context}]` : '';
    return `${prefix} ${entry.message}`;
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.config.context,
      data,
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(formattedMessage, data ?? '');
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.info(formattedMessage, data ?? '');
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(formattedMessage, data ?? '');
        break;
      case 'error':
        // eslint-disable-next-line no-console
        console.error(formattedMessage, data ?? '');
        break;
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  /**
   * Create a child logger with a specific context
   */
  child(context: string): Logger {
    return new Logger({
      ...this.config,
      context: this.config.context ? `${this.config.context}:${context}` : context,
    });
  }
}

// Default logger instance
export const logger = new Logger();

// Factory function to create contextual loggers
export const createLogger = (context: string): Logger => {
  return logger.child(context);
};

export default logger;