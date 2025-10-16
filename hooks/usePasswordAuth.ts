/**
 * usePasswordAuth Hook
 * Handles password-based authentication
 */

import { AuthService } from "@/services/authService";
import { NavigationService } from "@/services/navigationService";
import { UserStorageService } from "@/services/storageService";
import { AuthMethod, User } from "@/types/auth.types";
import { logger } from "@/utils/logger";
import { useCallback } from "react";

export interface UsePasswordAuthReturn {
  loginWithPassword: (email: string, password: string) => Promise<void>;
  hasPasswordAccount: () => Promise<boolean>;
  hasGitHubAccount: () => Promise<boolean>;
  clearPasswordAccount: () => Promise<void>;
}

export interface UsePasswordAuthOptions {
  setUser: (user: User | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setCurrentAuthMethod: (method: AuthMethod | null) => void;
  setIsLoading: (loading: boolean) => void;
  isBiometricSupported: boolean;
  isBiometricEnrolled: boolean;
  isBiometricEnabled: boolean;
}

/**
 * Hook for password authentication
 */
export function usePasswordAuth(
  options: UsePasswordAuthOptions
): UsePasswordAuthReturn {
  const {
    setUser,
    setIsAuthenticated,
    setCurrentAuthMethod,
    setIsLoading,
    isBiometricSupported,
    isBiometricEnrolled,
    isBiometricEnabled,
  } = options;

  /**
   * Login with password
   */
  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);

        logger.auth("Login attempt with email", email);

        // Use AuthService for authentication
        const user = await AuthService.loginWithPassword(email, password);

        setUser(user);
        setIsAuthenticated(true);
        setCurrentAuthMethod("password");
        logger.success("Password login completed");

        // Small delay to ensure state is updated
        await new Promise((resolve) => setTimeout(resolve, 100));

        NavigationService.toTabs();

        // Show biometric setup prompt if conditions are met
        if (
          isBiometricSupported &&
          isBiometricEnrolled &&
          !isBiometricEnabled
        ) {
          logger.auth("Biometric setup conditions met", {
            isBiometricSupported,
            isBiometricEnrolled,
            isBiometricEnabled,
          });

          // Delay to show prompt after navigation
          setTimeout(() => {
            logger.info("Biometric setup prompt ready");
            // Note: Alert will be shown in login.tsx's handlePasswordAuth
          }, 2000);
        }
      } catch (error) {
        logger.error("Login error", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [
      setUser,
      setIsAuthenticated,
      setCurrentAuthMethod,
      setIsLoading,
      isBiometricSupported,
      isBiometricEnrolled,
      isBiometricEnabled,
    ]
  );

  /**
   * Check if password account exists
   */
  const hasPasswordAccount = useCallback(async (): Promise<boolean> => {
    return UserStorageService.hasUser("password");
  }, []);

  /**
   * Check if GitHub account exists
   */
  const hasGitHubAccount = useCallback(async (): Promise<boolean> => {
    return UserStorageService.hasUser("github");
  }, []);

  /**
   * Clear password account
   */
  const clearPasswordAccount = useCallback(async () => {
    try {
      logger.auth("Clearing stored password account...");
      await UserStorageService.deleteUser("password");
      logger.success("Password account cleared");
    } catch (error) {
      logger.error("Error clearing password account", error);
    }
  }, []);

  return {
    loginWithPassword,
    hasPasswordAccount,
    hasGitHubAccount,
    clearPasswordAccount,
  };
}
