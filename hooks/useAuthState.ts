/**
 * useAuthState Hook
 * Manages core authentication state and basic operations
 */

import { UserStorageService } from "@/services/storageService";
import { AuthMethod, User } from "@/types/auth.types";
import { logger } from "@/utils/logger";
import { useCallback, useState } from "react";

export interface UseAuthStateReturn {
  user: User | null;
  isAuthenticated: boolean;
  currentAuthMethod: AuthMethod | null;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setCurrentAuthMethod: (method: AuthMethod | null) => void;
  restoreAuthState: () => Promise<void>;
  clearAuthState: () => void;
}

/**
 * Hook for managing core authentication state
 */
export function useAuthState(): UseAuthStateReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAuthMethod, setCurrentAuthMethod] = useState<AuthMethod | null>(
    null
  );

  /**
   * Restore authentication state from storage
   */
  const restoreAuthState = useCallback(async () => {
    try {
      logger.auth("Restoring authentication state...");

      const storedMethod = await UserStorageService.getCurrentAuthMethod();

      if (!storedMethod) {
        logger.info("No previous authentication found");
        return;
      }

      const storedUser = await UserStorageService.getUserByMethod(storedMethod);

      if (storedUser) {
        logger.auth("Found stored user data", {
          username: storedUser.username,
          authMethod: storedUser.authMethod,
          email: storedUser.email,
        });

        setUser(storedUser);
        setIsAuthenticated(true);
        setCurrentAuthMethod(storedMethod);
        logger.success("Authentication state restored successfully");
      } else {
        logger.info("No stored user data found");
      }
    } catch (error) {
      logger.error("Error restoring authentication state", error);
    }
  }, []);

  /**
   * Clear authentication state (for logout)
   */
  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentAuthMethod(null);
    logger.auth("Authentication state cleared");
  }, []);

  return {
    user,
    isAuthenticated,
    currentAuthMethod,
    setUser,
    setIsAuthenticated,
    setCurrentAuthMethod,
    restoreAuthState,
    clearAuthState,
  };
}
