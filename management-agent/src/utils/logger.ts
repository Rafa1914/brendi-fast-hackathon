type LogLevel = 'info' | 'error' | 'warn' | 'debug';

interface LogOptions {
  level?: LogLevel;
  context?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  };

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, any>
  ): string {
    const timestamp = this.getTimestamp();
    const levelColors = {
      info: this.colors.cyan,
      error: this.colors.red,
      warn: this.colors.yellow,
      debug: this.colors.magenta,
    };

    const levelSymbols = {
      info: 'ℹ',
      error: '✖',
      warn: '⚠',
      debug: '🔍',
    };

    const color = levelColors[level];
    const symbol = levelSymbols[level];
    const contextStr = context ? `${this.colors.dim}[${context}]${this.colors.reset}` : '';
    const metadataStr = metadata ? ` ${this.colors.dim}${JSON.stringify(metadata)}${this.colors.reset}` : '';

    return `${this.colors.dim}${timestamp}${this.colors.reset} ${color}${symbol}${this.colors.reset} ${contextStr} ${message}${metadataStr}`;
  }

  info(message: string, options?: LogOptions): void {
    console.log(
      this.formatMessage('info', message, options?.context, options?.metadata)
    );
  }

  error(message: string, error?: Error | unknown, options?: LogOptions): void {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    
    console.error(
      this.formatMessage('error', message, options?.context, {
        ...options?.metadata,
        error: errorDetails,
      })
    );
  }

  warn(message: string, options?: LogOptions): void {
    console.warn(
      this.formatMessage('warn', message, options?.context, options?.metadata)
    );
  }

  debug(message: string, options?: LogOptions): void {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      console.log(
        this.formatMessage('debug', message, options?.context, options?.metadata)
      );
    }
  }

  // Método específico para logs de requisições HTTP
  httpRequest(method: string, path: string, statusCode: number, duration: number, options?: LogOptions): void {
    const statusColor = statusCode >= 500 
      ? this.colors.red 
      : statusCode >= 400 
      ? this.colors.yellow 
      : this.colors.green;

    const methodColors: Record<string, string> = {
      GET: this.colors.blue,
      POST: this.colors.green,
      PUT: this.colors.yellow,
      DELETE: this.colors.red,
      PATCH: this.colors.magenta,
    };

    const methodColor = methodColors[method] || this.colors.white;
    const timestamp = this.getTimestamp();
    const contextStr = options?.context ? `${this.colors.dim}[${options.context}]${this.colors.reset}` : '';

    console.log(
      `${this.colors.dim}${timestamp}${this.colors.reset} ` +
      `${this.colors.cyan}🌐${this.colors.reset} ` +
      `${contextStr} ` +
      `${methodColor}${method}${this.colors.reset} ` +
      `${path} ` +
      `${statusColor}${statusCode}${this.colors.reset} ` +
      `${this.colors.dim}(${duration}ms)${this.colors.reset}`
    );
  }
}

export const logger = new Logger();

