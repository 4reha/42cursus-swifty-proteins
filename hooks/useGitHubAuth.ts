/**
 * useGitHubAuth Hook
 * Handles GitHub OAuth flow and token exchange
 */

import { GITHUB_OAUTH_CONFIG } from "@/config/oauth";
import { AuthService } from "@/services/authService";
import { NavigationService } from "@/services/navigationService";
import { UserStorageService } from "@/services/storageService";
import { AuthMethod, User } from "@/types/auth.types";
import { logger } from "@/utils/logger";
import * as AuthSession from "expo-auth-session";
import { useCallback, useEffect, useState } from "react";

export interface UseGitHubAuthReturn {
  loginWithGitHub: () => Promise<void>;
  isOAuthInProgress: boolean;
}

export interface UseGitHubAuthOptions {
  setUser: (user: User | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setCurrentAuthMethod: (method: AuthMethod | null) => void;
  setIsLoading: (loading: boolean) => void;
}

/**
 * Hook for GitHub OAuth authentication
 */
export function useGitHubAuth(
  options: UseGitHubAuthOptions
): UseGitHubAuthReturn {
  const { setUser, setIsAuthenticated, setCurrentAuthMethod, setIsLoading } =
    options;

  const [isOAuthInProgress, setIsOAuthInProgress] = useState(false);

  // OAuth request configuration
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GITHUB_OAUTH_CONFIG.clientId,
      scopes: GITHUB_OAUTH_CONFIG.scopes,
      redirectUri: GITHUB_OAUTH_CONFIG.redirectUri,
    },
    {
      authorizationEndpoint: GITHUB_OAUTH_CONFIG.authorizationEndpoint,
    }
  );

  /**
   * Handle successful GitHub authentication
   */
  const handleGitHubAuthSuccess = useCallback(
    async (code: string) => {
      try {
        logger.oauth("Processing GitHub authentication...");

        // Use the new AuthService
        const newUser = await AuthService.loginWithGitHub(
          code,
          request && (request as any).codeVerifier
            ? (request as any).codeVerifier
            : undefined
        );

        setUser(newUser);
        setIsAuthenticated(true);
        setCurrentAuthMethod("github");
        logger.success("GitHub login completed");

        // Verify storage
        const storedAuthMethod =
          await UserStorageService.getCurrentAuthMethod();
        const hasUserData = await UserStorageService.hasUser("github");
        logger.debug("Storage verification", {
          authMethod: storedAuthMethod,
          hasUserData,
        });

        // Small delay to ensure state and storage are updated
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Clear OAuth in progress flag
        setIsOAuthInProgress(false);

        NavigationService.toTabs();
      } catch (error) {
        logger.error("GitHub authentication error", error);
        setIsLoading(false);
        setIsOAuthInProgress(false);
        throw error;
      }
    },
    [request, setUser, setIsAuthenticated, setCurrentAuthMethod, setIsLoading]
  );

  /**
   * Handle OAuth response
   */
  useEffect(() => {
    if (response?.type === "success") {
      logger.success("OAuth success - Code received", response.params.code);
      handleGitHubAuthSuccess(response.params.code);
    } else if (response?.type === "error") {
      logger.error("OAuth error", response.error);
      setIsLoading(false);
      setIsOAuthInProgress(false);
    } else if (response?.type === "cancel") {
      logger.warning("OAuth cancelled by user");
      setIsLoading(false);
      setIsOAuthInProgress(false);
    }
  }, [response, handleGitHubAuthSuccess, setIsLoading]);

  /**
   * Initiate GitHub OAuth flow
   */
  const loginWithGitHub = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsOAuthInProgress(true);

      logger.oauth("Redirect URI", GITHUB_OAUTH_CONFIG.redirectUri);
      logger.oauth("Client ID", GITHUB_OAUTH_CONFIG.clientId);

      if (!request) {
        logger.error("OAuth request not ready");
        setIsLoading(false);
        setIsOAuthInProgress(false);
        return;
      }

      const result = await promptAsync();
      logger.oauth("GitHub login result", result.type);

      if (result.type !== "success") {
        setIsLoading(false);
        setIsOAuthInProgress(false);
      }
    } catch (error) {
      logger.error("GitHub login error", error);
      setIsLoading(false);
      setIsOAuthInProgress(false);
      throw error;
    }
  }, [request, promptAsync, setIsLoading]);

  return {
    loginWithGitHub,
    isOAuthInProgress,
  };
}
