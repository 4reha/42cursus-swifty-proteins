/**
 * Biometric Service
 * Handles biometric authentication capabilities and operations
 */

import { BiometricCapabilities } from "@/types/auth.types";
import { logger } from "@/utils/logger";
import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

export class BiometricService {
  /**
   * Check if device supports biometric authentication
   */
  static async checkCapabilities(): Promise<BiometricCapabilities> {
    try {
      const isSupported = await LocalAuthentication.hasHardwareAsync();

      if (!isSupported) {
        logger.info("Biometric hardware not supported");
        return {
          isSupported: false,
          isEnrolled: false,
          biometricType: "none",
        };
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType = "unknown";
      if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        biometricType = "face";
      } else if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FINGERPRINT
        )
      ) {
        biometricType = "fingerprint";
      } else if (
        supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)
      ) {
        biometricType = "iris";
      }

      logger.info("Biometric capabilities checked", {
        isSupported,
        isEnrolled,
        biometricType,
      });

      return {
        isSupported,
        isEnrolled,
        biometricType,
      };
    } catch (error) {
      logger.error("Error checking biometric capabilities", error);
      return {
        isSupported: false,
        isEnrolled: false,
        biometricType: "none",
      };
    }
  }

  /**
   * Authenticate user with biometrics
   */
  static async authenticate(promptMessage?: string): Promise<boolean> {
    try {
      const capabilities = await this.checkCapabilities();

      if (!capabilities.isSupported || !capabilities.isEnrolled) {
        logger.warning("Biometric authentication not available");
        return false;
      }

      logger.auth("Requesting biometric authentication...");

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || "Authenticate to continue",
        fallbackLabel: "Use Password",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        logger.success("Biometric authentication successful");
      } else {
        logger.warning("Biometric authentication failed or cancelled");
      }

      return result.success;
    } catch (error) {
      logger.error("Biometric authentication error", error);
      return false;
    }
  }

  /**
   * Get human-readable biometric type name
   */
  static getBiometricTypeName(type: string): string {
    const names: Record<string, string> = {
      face: Platform.OS === "ios" ? "Face ID" : "Face Recognition",
      fingerprint: Platform.OS === "ios" ? "Touch ID" : "Fingerprint",
      iris: "Iris Scanner",
      unknown: "Biometric",
      none: "Not Available",
    };

    return names[type] || "Biometric";
  }

  /**
   * Get appropriate icon name for biometric type
   */
  static getBiometricIcon(type: string): string {
    const icons: Record<string, string> = {
      face: "face-recognition",
      fingerprint: "finger-print",
      iris: "eye",
      unknown: "lock-closed",
      none: "lock-closed",
    };

    return icons[type] || "lock-closed";
  }

  /**
   * Check if biometric authentication is available (supported and enrolled)
   */
  static async isAvailable(): Promise<boolean> {
    const capabilities = await this.checkCapabilities();
    return capabilities.isSupported && capabilities.isEnrolled;
  }
}
