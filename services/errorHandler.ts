/**
 * Error Handler Service
 * Centralized error handling and user feedback
 */

import { logger } from "@/utils/logger";

export class ErrorHandler {
  /**
   * Extract a user-friendly error message
   */
  static extractMessage(error: unknown): string {
    if (!error) return "An unknown error occurred";

    if (typeof error === "string") return error;

    if (error instanceof Error) return error.message;

    if (typeof error === "object" && "message" in error) {
      return String(error.message);
    }

    return "An unknown error occurred";
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error: unknown): string {
    const message = this.extractMessage(error);
    logger.error("Authentication error", message);

    // Map common errors to user-friendly messages
    const errorMap: Record<string, string> = {
      "Invalid email or password": "Invalid email or password",
      "GitHub authentication failed":
        "GitHub authentication failed. Please try again.",
      "Biometric authentication not available":
        "Biometric authentication is not available on this device",
      "Biometric authentication not enabled":
        "Please login first to enable biometric authentication",
      "Biometric authentication failed":
        "Biometric authentication failed. Please try again.",
      "No user data found": "Please login first",
    };

    return errorMap[message] || message || "Authentication failed";
  }

  /**
   * Handle API/network errors
   */
  static handleApiError(error: unknown): string {
    const message = this.extractMessage(error);
    logger.error("API error", message);

    if (message.includes("Network")) {
      return "Network error. Please check your connection.";
    }

    if (message.includes("timeout")) {
      return "Request timeout. Please try again.";
    }

    if (message.includes("404")) {
      return "Resource not found";
    }

    if (message.includes("500")) {
      return "Server error. Please try again later.";
    }

    return message || "Failed to fetch data";
  }

  /**
   * Handle general errors
   */
  static handle(error: unknown, context?: string): string {
    const message = this.extractMessage(error);
    logger.error(context ? `${context}:` : "Error:", message);
    return message || "An error occurred";
  }
}
