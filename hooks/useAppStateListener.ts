/**
 * useAppStateListener Hook
 * Manages app state changes and handles background/foreground transitions
 */

import { NavigationService } from "@/services/navigationService";
import { logger } from "@/utils/logger";
import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

export interface UseAppStateListenerOptions {
  isOAuthInProgress: boolean;
  isSharingInProgress: boolean;
  clearAuthState: () => void;
}

/**
 * Hook for listening to app state changes
 */
export function useAppStateListener(options: UseAppStateListenerOptions): void {
  const { isOAuthInProgress, isSharingInProgress, clearAuthState } = options;

  const appState = useRef(AppState.currentState);
  const sharingInProgressRef = useRef(false);

  /**
   * Force logout when app comes from background
   */
  const forceLogoutOnBackground = useCallback(() => {
    // Clear authentication state but keep user data for biometric re-login
    clearAuthState();

    // Force navigation to login screen
    NavigationService.toLogin();
    logger.auth("Forced logout on background");
  }, [clearAuthState]);

  /**
   * Handle app state changes
   */
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      // Detect when app comes back from background
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        logger.info("App came to foreground from background/inactive");

        // Don't force logout if OAuth or sharing is in progress
        if (isOAuthInProgress) {
          logger.info("OAuth in progress - skipping logout");
          return;
        }
        if (isSharingInProgress || sharingInProgressRef.current) {
          logger.info("Sharing in progress - skipping logout");
          // Reset the ref when we detect sharing was in progress
          sharingInProgressRef.current = false;
          return;
        }

        logger.info("No special operations in progress - forcing logout");
        forceLogoutOnBackground();
      }

      appState.current = nextAppState;
      logger.debug("App state updated", nextAppState);
    },
    [isOAuthInProgress, isSharingInProgress, forceLogoutOnBackground]
  );

  /**
   * Update sharing ref when sharing state changes
   */
  useEffect(() => {
    sharingInProgressRef.current = isSharingInProgress;
  }, [isSharingInProgress]);

  /**
   * Monitor app state changes
   */
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, [handleAppStateChange]);
}
