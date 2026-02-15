import winston from 'winston';
import path from 'path';

const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info';
const LOG_FILE = process.env.LOG_FILE ?? 'logs/app.log';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, requestId, step, duration, status, ...meta }) => {
    const base = `${timestamp} [${level.toUpperCase()}]`;
    const context = [
      requestId ? `requestId=${requestId}` : null,
      step ? `step=${step}` : null,
      duration !== undefined ? `duration=${duration}ms` : null,
      status ? `status=${status}` : null,
    ].filter(Boolean).join(' ');

    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${base} ${context ? `[${context}] ` : ''}${message}${metaStr}`;
  })
);

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    new winston.transports.File({
      filename: path.resolve(process.cwd(), '..', LOG_FILE),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

export interface LogContext {
  requestId: string;
  step?: string;
  duration?: number;
  status?: 'success' | 'error';
}

export function createLogger(requestId: string): {
  info: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  debug: (message: string, meta?: Record<string, unknown>) => void;
  withStep: (step: string) => {
    info: (message: string, meta?: Record<string, unknown>) => void;
    error: (message: string, meta?: Record<string, unknown>) => void;
    success: (message: string, duration: number, meta?: Record<string, unknown>) => void;
  };
} {
  const log = (level: string, message: string, meta: Record<string, unknown> = {}) => {
    logger.log(level, message, { requestId, ...meta });
  };

  return {
    info: (message, meta) => log('info', message, meta),
    error: (message, meta) => log('error', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    debug: (message, meta) => log('debug', message, meta),
    withStep: (step: string) => ({
      info: (message, meta) => log('info', message, { step, ...meta }),
      error: (message, meta) => log('error', message, { step, status: 'error', ...meta }),
      success: (message, duration, meta) => log('info', message, { step, duration, status: 'success', ...meta }),
    }),
  };
}

export { logger };
