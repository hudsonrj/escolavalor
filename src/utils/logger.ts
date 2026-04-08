/**
 * Logger estruturado JSON
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogSource = 'crawler' | 'api' | 'score' | 'db' | 'system';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  meta?: Record<string, unknown>;
}

export function log(
  level: LogLevel,
  source: LogSource,
  message: string,
  meta?: Record<string, unknown>
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    source,
    message,
    meta,
  };

  console.log(JSON.stringify(entry));
}

export const logger = {
  info: (source: LogSource, message: string, meta?: Record<string, unknown>) =>
    log('info', source, message, meta),
  warn: (source: LogSource, message: string, meta?: Record<string, unknown>) =>
    log('warn', source, message, meta),
  error: (source: LogSource, message: string, meta?: Record<string, unknown>) =>
    log('error', source, message, meta),
  debug: (source: LogSource, message: string, meta?: Record<string, unknown>) =>
    log('debug', source, message, meta),
};
