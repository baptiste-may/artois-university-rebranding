const PREFIX = "[rebranding]";
const DEBUG_QUERY_PARAM = "rebranding-debug";

const debugEnabled =
  import.meta.env.DEV || new URLSearchParams(window.location.search).has(DEBUG_QUERY_PARAM);

export type Logger = {
  debug(message: string, ...details: unknown[]): void;
  info(message: string, ...details: unknown[]): void;
  warn(message: string, ...details: unknown[]): void;
  error(message: string, ...details: unknown[]): void;
};

function write(
  level: "debug" | "info" | "warn" | "error",
  message: string,
  details: unknown[],
): void {
  if ((level === "debug" || level === "info") && !debugEnabled) {
    return;
  }

  switch (level) {
    case "debug":
      console.debug(message, ...details);
      break;
    case "info":
      console.info(message, ...details);
      break;
    case "warn":
      console.warn(message, ...details);
      break;
    case "error":
      console.error(message, ...details);
      break;
  }
}

export function createLogger(scope: string): Logger {
  const prefix = `${PREFIX}[${scope}]`;

  return {
    debug: (message, ...details) => write("debug", `${prefix} ${message}`, details),
    info: (message, ...details) => write("info", `${prefix} ${message}`, details),
    warn: (message, ...details) => write("warn", `${prefix} ${message}`, details),
    error: (message, ...details) => write("error", `${prefix} ${message}`, details),
  };
}
