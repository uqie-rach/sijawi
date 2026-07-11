import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'api.log');

// Ensure log directory exists
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
} catch {
  // Ignore if directory already exists
}

interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  durationMs: number;
  error?: string;
  ip?: string;
}

function writeLog(entry: LogEntry): void {
  try {
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(LOG_FILE, line, 'utf8');
  } catch (err) {
    console.error('[API Logger] Failed to write log:', err);
  }
}

export function logApiRequest(
  method: string,
  url: string,
  status: number,
  durationMs: number,
  error?: string,
  ip?: string,
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    method,
    url,
    status,
    durationMs: Math.round(durationMs),
    ip: ip || undefined,
    error: error || undefined,
  };
  writeLog(entry);

  // Also log to console for immediate debugging
  if (status >= 400) {
    console.error(`[API] ${method} ${url} → ${status} (${durationMs}ms)${error ? ' | Error: ' + error : ''}`);
  } else {
    console.log(`[API] ${method} ${url} → ${status} (${durationMs}ms)`);
  }
}