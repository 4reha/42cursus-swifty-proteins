/**
 * Centralized logging utility
 * Provides consistent logging across the application with emoji prefixes
 */

type LogLevel = "info" | "success" | "error" | "warning" | "debug";

interface LogConfig {
  enabled: boolean;
  levels: Record<LogLevel, boolean>;
}

const config: LogConfig = {
  enabled: __DEV__,
  levels: {
    info: true,
    success: true,
    error: true,
    warning: true,
    debug: true,
  },
};

const prefixes: Record<LogLevel, string> = {
  info: "ℹ️",
  success: "✅",
  error: "❌",
  warning: "⚠️",
  debug: "🔍",
};

class Logger {
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!config.enabled || !config.levels[level]) return;

    const prefix = prefixes[level];
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];

    console.log(`${prefix} [${timestamp}] ${message}`, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log("info", message, ...args);
  }

  success(message: string, ...args: any[]): void {
    this.log("success", message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log("error", message, ...args);
  }

  warning(message: string, ...args: any[]): void {
    this.log("warning", message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log("debug", message, ...args);
  }

  // Special logging methods for specific flows
  auth(message: string, ...args: any[]): void {
    this.log("info", `🔐 ${message}`, ...args);
  }

  oauth(message: string, ...args: any[]): void {
    this.log("info", `🔗 ${message}`, ...args);
  }

  storage(message: string, ...args: any[]): void {
    this.log("info", `💾 ${message}`, ...args);
  }

  navigation(message: string, ...args: any[]): void {
    this.log("info", `🧭 ${message}`, ...args);
  }

  api(message: string, ...args: any[]): void {
    this.log("info", `🌐 ${message}`, ...args);
  }
}

export const logger = new Logger();
export default logger;
