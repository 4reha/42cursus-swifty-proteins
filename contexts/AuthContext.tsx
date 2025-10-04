import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as AuthSession from "expo-auth-session";
import * as LocalAuthentication from "expo-local-authentication";
import { GITHUB_OAUTH_CONFIG } from "../config/oauth";
import { useAuthToken, useUserInfo } from "../services/queries";

interface User {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loginWithGitHub: () => Promise<boolean>;
  loginWithBiometric: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isBiometricSetup: boolean;
  setupBiometric: () => Promise<boolean>;
  hasPreviouslyAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  readonly children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricSetup, setIsBiometricSetup] = useState(false);
  const [hasPreviouslyAuthenticated, setHasPreviouslyAuthenticated] =
    useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [codeVerifier, setCodeVerifier] = useState<string | undefined>(
    undefined
  );

  // React Query hooks for authentication
  const tokenQuery = useAuthToken(authCode || "", codeVerifier);
  const userQuery = useUserInfo(tokenQuery.data?.access_token || "");

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

  useEffect(() => {
    initializeAuth();
  }, []);

  // Handle app state changes for security
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log("🔄 App state changed:", appState, "->", nextAppState);

      if (appState.match(/inactive|background/) && nextAppState === "active") {
        // App has come to the foreground from background/inactive state
        console.log(
          "🔒 App returned from background - requiring re-authentication for security"
        );
        setIsAuthenticated(false);
      }

      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [appState]);

  useEffect(() => {
    if (response?.type === "success") {
      console.log("✅ OAuth success - Code received:", response.params.code);
      setAuthCode(response.params.code);
      setCodeVerifier(request?.codeVerifier);
    } else if (response?.type === "error") {
      console.error("❌ OAuth error:", response.error);
      setIsLoading(false);
    } else if (response?.type === "cancel") {
      console.log("⚠️ OAuth cancelled by user");
      setIsLoading(false);
    }
  }, [response, request?.codeVerifier]);

  // Handle token exchange success
  useEffect(() => {
    if (tokenQuery.data?.access_token) {
      console.log("✅ Access token received via React Query");
    }
    if (tokenQuery.error) {
      console.error("❌ Token exchange error:", tokenQuery.error);
      setIsLoading(false);
    }
  }, [tokenQuery.data, tokenQuery.error]);

  // Handle user data success
  useEffect(() => {
    if (userQuery.data) {
      console.log(
        "👤 User data received via React Query:",
        userQuery.data.login
      );
      handleAuthSuccess(userQuery.data, tokenQuery.data?.access_token || "");
    }
    if (userQuery.error) {
      console.error("❌ User data fetch error:", userQuery.error);
      setIsLoading(false);
    }
  }, [userQuery.data, userQuery.error, tokenQuery.data?.access_token]);

  const initializeAuth = async () => {
    try {
      console.log("🔄 Initializing authentication...");
      console.log("🔧 Client ID:", GITHUB_OAUTH_CONFIG.clientId);
      console.log("🔧 Redirect URI:", GITHUB_OAUTH_CONFIG.redirectUri);

      const storedUser = await SecureStore.getItemAsync("user");
      const biometricSetup = await SecureStore.getItemAsync("biometric_setup");
      const hasAuthenticated = await SecureStore.getItemAsync(
        "has_authenticated_before"
      );

      setHasPreviouslyAuthenticated(hasAuthenticated === "true");
      setIsBiometricSetup(biometricSetup === "true");

      // Store user data for potential biometric login
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        console.log("👤 User data loaded from storage");
      }

      // Per requirement: "Login View should ALWAYS be displayed when launching the app"
      setIsAuthenticated(false);
      console.log("✅ Auth initialization complete");
    } catch (error) {
      console.error("❌ Error initializing auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async (userData: User, accessToken: string) => {
    try {
      console.log("🔄 Processing authentication success...");

      // Store user data and authentication state
      await SecureStore.setItemAsync("user", JSON.stringify(userData));
      await SecureStore.setItemAsync("github_access_token", accessToken);
      await SecureStore.setItemAsync("has_authenticated_before", "true");

      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      setHasPreviouslyAuthenticated(true);
      setIsLoading(false);

      console.log("✅ Authentication completed successfully");
    } catch (error) {
      console.error("❌ Error storing auth data:", error);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const loginWithGitHub = async (): Promise<boolean> => {
    try {
      console.log("🔄 Starting GitHub login...");
      setIsLoading(true);

      if (!request) {
        console.error("❌ OAuth request not ready");
        return false;
      }

      const result = await promptAsync();
      console.log("🔐 GitHub login result:", result.type);

      if (result.type === "success") {
        // The success handling is done in the useEffect
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("❌ GitHub login error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const setupBiometric = async (): Promise<boolean> => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!compatible || !enrolled) {
        console.log("⚠️ Biometric authentication not available");
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Set up biometric authentication for future logins",
        cancelLabel: "Skip",
        biometricsSecurityLevel: "strong",
      });

      if (result.success) {
        await SecureStore.setItemAsync("biometric_setup", "true");
        setIsBiometricSetup(true);
        console.log("✅ Biometric authentication set up");
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Biometric setup error:", error);
      return false;
    }
  };

  const loginWithBiometric = async (): Promise<boolean> => {
    try {
      if (!isBiometricSetup || !hasPreviouslyAuthenticated) {
        console.log("⚠️ Biometric login not available");
        return false;
      }

      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!compatible || !enrolled) {
        console.log("⚠️ Biometric hardware not available");
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access Protein Visualizer",
        cancelLabel: "Cancel",
        biometricsSecurityLevel: "strong",
      });

      if (result.success) {
        // Get stored user data
        const storedUser = await SecureStore.getItemAsync("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          console.log("✅ Biometric authentication successful");
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("❌ Biometric authentication error:", error);
      return false;
    }
  };

  const logout = () => {
    try {
      console.log("🔄 Logging out...");
      setIsAuthenticated(false);
      setUser(null);
      // Keep stored data for biometric login
      console.log("✅ Logged out successfully");
    } catch (error) {
      console.error("❌ Error during logout:", error);
    }
  };

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      user,
      loginWithGitHub,
      loginWithBiometric,
      logout,
      isLoading,
      isBiometricSetup,
      setupBiometric,
      hasPreviouslyAuthenticated,
    }),
    [
      isAuthenticated,
      user,
      isLoading,
      isBiometricSetup,
      hasPreviouslyAuthenticated,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
