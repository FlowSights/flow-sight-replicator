/**
 * Sistema de logging estructurado para producción
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  message: string;
  level: LogLevel;
  context?: string;
  userId?: string;
  timestamp: string;
  details?: any;
}

class Logger {
  private formatLog(level: LogLevel, message: string, details?: any, context?: string): LogPayload {
    return {
      message,
      level,
      context,
      timestamp: new Date().toISOString(),
      details: details instanceof Error ? {
        name: details.name,
        message: details.message,
        stack: details.stack
      } : details
    };
  }

  private sendToConsole(payload: LogPayload) {
    const { level, message, timestamp, context, details } = payload;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''}: ${message}`;
    
    switch (level) {
      case 'error':
        console.error(prefix, details || '');
        break;
      case 'warn':
        console.warn(prefix, details || '');
        break;
      case 'info':
        console.info(prefix, details || '');
        break;
      default:
        console.log(prefix, details || '');
    }
  }

  info(message: string, details?: any, context?: string) {
    this.sendToConsole(this.formatLog('info', message, details, context));
  }

  warn(message: string, details?: any, context?: string) {
    this.sendToConsole(this.formatLog('warn', message, details, context));
  }

  error(message: string, details?: any, context?: string) {
    this.sendToConsole(this.formatLog('error', message, details, context));
  }

  debug(message: string, details?: any, context?: string) {
    if (import.meta.env.DEV) {
      this.sendToConsole(this.formatLog('debug', message, details, context));
    }
  }
}

export const logger = new Logger();

/**
 * Formateador de errores estructurados para la API y UI
 */
export const formatError = (error: any, fallbackMessage: string = 'Ha ocurrido un error inesperado') => {
  const message = error?.message || error?.msg || fallbackMessage;
  const code = error?.code || error?.error_code || 'UNKNOWN_ERROR';
  
  return {
    success: false,
    error: {
      code,
      message,
      details: error?.details || null,
      timestamp: new Date().toISOString()
    }
  };
};
