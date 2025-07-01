import { log } from 'console';
import fs from 'fs';
import path from 'path';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

class Logger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private writeLog(entry: LogEntry): void {
    const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
    const logLine = `${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.message}${entry.data ? ` ${JSON.stringify(entry.data)}` : ''}\n`;
    
    fs.appendFileSync(logFile, logLine);
  }

  private createEntry(level: LogEntry['level'], message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
  }

  info(message: string, data?: any): void {
    const entry = this.createEntry('info', message, data);
    console.log(`[INFO] ${message}`, data || '');
    this.writeLog(entry);
  }

  warn(message: string, data?: any): void {
    const entry = this.createEntry('warn', message, data);
    console.warn(`[WARN] ${message}`, data || '');
    this.writeLog(entry);
  }

  error(message: string, data?: any): void {
    const entry = this.createEntry('error', message, data);
    console.error(`[ERROR] ${message}`, data || '');
    this.writeLog(entry);
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.createEntry('debug', message, data);
      console.debug(`[DEBUG] ${message}`, data || '');
      this.writeLog(entry);
    }
  }

  // Request logging middleware
  logRequest = (req: any, res: any, next: any): void => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        userId: (req as any).user?.id
      };

      if (res.statusCode >= 400) {
        this.warn(`HTTP ${res.statusCode}`, logData);
      } else {
        this.info(`HTTP ${res.statusCode}`, logData);
      }
    });

    next();
  }
}

export const logger = new Logger();
export default logger; 