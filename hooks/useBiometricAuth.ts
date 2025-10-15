/**
 * useBiometricAuth Hook
 * Handles biometric authentication capabilities and operations
 */

import { BiometricService } from "@/services/biometricService";
import { NavigationService } from "@/services/navigationService";
import {
  BiometricStorageService,
  UserStorageService,
} from "@/services/storageService";
import { AuthMethod, User } from "@/types/auth.types";
import { logger } from "@/utils/logger";
import { useCallback, useEffect, useState } from "react";

export interface UseBiometricAuthReturn {
  isBiometricSupported: boolean;
  isBiometricEnrolled: boolean;
  isBiometricEnabled: boolean;
  loginWithBiometric: () => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  checkBiometricCapabilities: () => Promise<void>;
}

export interface UseBiometricAuthOptions {
  setUser: (user: User | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setCurrentAuthMethod: (method: AuthMethod | null) => void;
}

/**
 * Hook for biometric authentication
 */
export function useBiometricAuth(
  options: UseBiometricAuthOptions
): UseBiometricAuthReturn {
  const { setUser, setIsAuthenticated, setCurrentAuthMethod } = options;

  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  /**
   * Check biometric capabilities
   */
  const checkBiometricCapabilities = useCallback(async () => {
    try {
      const capabilities = await BiometricService.checkCapabilities();

      setIsBiometricSupported(capabilities.isSupported);
      setIsBiometricEnrolled(capabilities.isEnrolled);

      if (capabilities.isSupported) {
        const enabled = await BiometricStorageService.isEnabled();
        setIsBiometricEnabled(enabled);
      }
    } catch (error) {
      logger.error("Error checking biometric capabilities", error);
    }
  }, []);

  /**
   * Check capabilities on mount
   */
  useEffect(() => {
    checkBiometricCapabilities();
  }, [checkBiometricCapabilities]);

  /**
   * Login with biometric
   */
  const loginWithBiometric = useCallback(async (): Promise<boolean> => {
    try {
      if (!isBiometricSupported || !isBiometricEnrolled) {
        throw new Error("Biometric authentication not available");
      }

      if (!isBiometricEnabled) {
        throw new Error(
          "Biometric authentication not enabled. Please login first."
        );
      }

      const authenticated = await BiometricService.authenticate(
        "Authenticate to access Swifty Protein"
      );

      if (authenticated) {
        // Get the last used auth method
        const lastAuthMethod = await UserStorageService.getCurrentAuthMethod();

        if (!lastAuthMethod) {
          throw new Error("No previous login found");
        }

        // Load user from appropriate storage
        const storedUser = await UserStorageService.getUserByMethod(
          lastAuthMethod
        );

        if (!storedUser) {
          throw new Error("No user data found");
        }

        setUser(storedUser);
        setIsAuthenticated(true);
        setCurrentAuthMethod(lastAuthMethod);

        logger.success("Biometric login successful");
        NavigationService.toTabs();
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Biometric authentication error", error);
      return false;
    }
  }, [
    isBiometricSupported,
    isBiometricEnrolled,
    isBiometricEnabled,
    setUser,
    setIsAuthenticated,
    setCurrentAuthMethod,
  ]);

  /**
   * Enable biometric authentication
   */
  const enableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      logger.auth("Enabling biometric authentication", {
        isBiometricSupported,
        isBiometricEnrolled,
        isBiometricEnabled,
      });

      if (!isBiometricSupported || !isBiometricEnrolled) {
        logger.warning("Biometric not supported or not enrolled");
        return false;
      }

      // Check if user is authenticated
      const currentAuthMethod = await UserStorageService.getCurrentAuthMethod();
      logger.debug("Checking stored auth method", currentAuthMethod);

      if (!currentAuthMethod) {
        logger.warning("No stored authentication method found");
        // Wait and retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const retryAuthMethod = await UserStorageService.getCurrentAuthMethod();
        logger.debug("Retry checking stored auth method", retryAuthMethod);

        if (!retryAuthMethod) {
          throw new Error(
            "Please login first to enable biometric authentication"
          );
        }
      }

      const hasUser = await UserStorageService.hasUser(
        currentAuthMethod || "password"
      );
      logger.debug("Checking stored user data", hasUser);

      if (!hasUser) {
        logger.warning("No stored user data found");
        // Wait and retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const retryHasUser = await UserStorageService.hasUser(
          currentAuthMethod || "password"
        );
        logger.debug("Retry checking stored user data", retryHasUser);

        if (!retryHasUser) {
          throw new Error(
            "Please login first to enable biometric authentication"
          );
        }
      }

      logger.success("Found stored authentication data, proceeding with setup");

      // Test biometric authentication
      const authenticated = await BiometricService.authenticate(
        "Enable biometric authentication"
      );

      if (authenticated) {
        await BiometricStorageService.enable();
        setIsBiometricEnabled(true);
        logger.success("Biometric authentication enabled");
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Enable biometric error", error);
      throw error;
    }
  }, [isBiometricSupported, isBiometricEnrolled, isBiometricEnabled]);

  /**
   * Disable biometric authentication
   */
  const disableBiometric = useCallback(async () => {
    try {
      await BiometricStorageService.disable();
      setIsBiometricEnabled(false);
      logger.success("Biometric authentication disabled");
    } catch (error) {
      logger.error("Disable biometric error", error);
    }
  }, []);

  return {
    isBiometricSupported,
    isBiometricEnrolled,
    isBiometricEnabled,
    loginWithBiometric,
    enableBiometric,
    disableBiometric,
    checkBiometricCapabilities,
  };
}
