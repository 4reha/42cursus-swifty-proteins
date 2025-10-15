import { NavigationService } from "@/services/navigationService";
import { globalStyles } from "@/styles/globalStyles";
import { logger } from "@/utils/logger";
import React, { useEffect } from "react";
import { Text, View } from "react-native";

/**
 * Lightweight OAuth redirect handler.
 *
 * Expo's AuthSession sometimes redirects back using a deep link path
 * (e.g. exp://.../--/oauth) which expo-router will try to resolve. If
 * there is no matching route the built-in "unmatched route" screen is
 * shown. Adding this route prevents that screen and lets the AuthSession
 * hook handle the response while we quickly navigate back to a safe route.
 */
export default function OAuthRedirect() {
  useEffect(() => {
    logger.navigation("OAuth redirect route hit. Returning to login.");

    // Small delay to allow AuthSession to process the incoming redirect
    // and populate the response used by the auth hook. Then navigate to
    // the app root (login or tabs will be chosen by the restored state).
    const t = setTimeout(() => {
      NavigationService.toLogin();
    }, 300);

    return () => clearTimeout(t);
  }, []);

  return (
    <View style={globalStyles.loadingContainer}>
      <Text style={globalStyles.bodyText}>Processing authentication...</Text>
    </View>
  );
}
