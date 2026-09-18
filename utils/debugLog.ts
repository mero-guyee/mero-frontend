let buffer: string[] = [];
const MAX_ENTRIES = 1000;

export function debugLog(message: string) {
  const line = `${new Date().toISOString().slice(11, 23)} ${message}`;
  console.log(message);
  buffer.push(line);
  if (buffer.length > MAX_ENTRIES) buffer.shift();
}

export function getDebugLogs(): string[] {
  return buffer;
}

export function clearDebugLogs() {
  buffer = [];
}
