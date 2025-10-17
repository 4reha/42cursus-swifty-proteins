/**
 * Auth Context (Refactored)
 * Simplified authentication context using custom hooks
 */

import { useAppStateListener } from "@/hooks/useAppStateListener";
import { useAuthState } from "@/hooks/useAuthState";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { useGitHubAuth } from "@/hooks/useGitHubAuth";
import { usePasswordAuth } from "@/hooks/usePasswordAuth";
import { NavigationService } from "@/services/navigationService";
import { AuthMethod, User } from "@/types/auth.types";
import { logger } from "@/utils/logger";
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

interface AuthContextType {
	// State
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	isBiometricSupported: boolean;
	isBiometricEnrolled: boolean;
	isBiometricEnabled: boolean;
	currentAuthMethod: AuthMethod | null;

	// Auth methods
	loginWithPassword: (email: string, password: string) => Promise<void>;
	loginWithGitHub: () => Promise<boolean>;
	loginWithBiometric: () => Promise<boolean>;
	logout: () => Promise<void>;

	// Biometric settings
	enableBiometric: () => Promise<boolean>;
	disableBiometric: () => Promise<void>;

	// Check if accounts exist
	hasPasswordAccount: () => Promise<boolean>;
	hasGitHubAccount: () => Promise<boolean>;

	// Sharing state management
	setSharingInProgress: (inProgress: boolean) => void;

	// Utility functions
	clearPasswordAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const [isLoading, setIsLoading] = useState(true);
	const [isSharingInProgress, setIsSharingInProgress] = useState(false);

	// Core auth state
	const {
		user,
		isAuthenticated,
		currentAuthMethod,
		setUser,
		setIsAuthenticated,
		setCurrentAuthMethod,
		restoreAuthState,
		clearAuthState,
	} = useAuthState();

	// Biometric authentication (must be before password auth to get current state)
	const biometricAuth = useBiometricAuth({
		setUser,
		setIsAuthenticated,
		setCurrentAuthMethod,
	});

	// Password authentication with biometric state
	const passwordAuth = usePasswordAuth({
		setUser,
		setIsAuthenticated,
		setCurrentAuthMethod,
		setIsLoading,
		isBiometricSupported: biometricAuth.isBiometricSupported,
		isBiometricEnrolled: biometricAuth.isBiometricEnrolled,
		isBiometricEnabled: biometricAuth.isBiometricEnabled,
	});

	// GitHub OAuth authentication
	const githubAuth = useGitHubAuth({
		setUser,
		setIsAuthenticated,
		setCurrentAuthMethod,
		setIsLoading,
	});

	// App state listener for background/foreground transitions
	useAppStateListener({
		isOAuthInProgress: githubAuth.isOAuthInProgress,
		isSharingInProgress,
		clearAuthState,
	});

	/**
	 * Initialize authentication state
	 */
	useEffect(() => {
		const initialize = async () => {
			try {
				await biometricAuth.checkBiometricCapabilities();
				await restoreAuthState();
			} catch (error) {
				logger.error("Error initializing auth", error);
			} finally {
				setIsLoading(false);
			}
		};

		initialize();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Only run once on mount

	/**
	 * Logout user
	 */
	const logout = useCallback(async () => {
		try {
			clearAuthState();
			NavigationService.toLogin();
			logger.auth("User logged out");
		} catch (error) {
			logger.error("Logout error", error);
		}
	}, [clearAuthState]);

	/**
	 * Set sharing in progress state
	 */
	const setSharingInProgressCallback = useCallback((inProgress: boolean) => {
		logger.auth("setSharingInProgress called", inProgress);
		setIsSharingInProgress(inProgress);
	}, []);

	/**
	 * Memoized context value
	 */
	const value = useMemo<AuthContextType>(
		() => ({
			// State
			user,
			isAuthenticated,
			isLoading,
			isBiometricSupported: biometricAuth.isBiometricSupported,
			isBiometricEnrolled: biometricAuth.isBiometricEnrolled,
			isBiometricEnabled: biometricAuth.isBiometricEnabled,
			currentAuthMethod,

			// Auth methods
			loginWithPassword: passwordAuth.loginWithPassword,
			loginWithGitHub: githubAuth.loginWithGitHub,
			loginWithBiometric: biometricAuth.loginWithBiometric,
			logout,

			// Biometric settings
			enableBiometric: biometricAuth.enableBiometric,
			disableBiometric: biometricAuth.disableBiometric,

			// Account checks
			hasPasswordAccount: passwordAuth.hasPasswordAccount,
			hasGitHubAccount: passwordAuth.hasGitHubAccount,

			// Sharing state
			setSharingInProgress: setSharingInProgressCallback,

			// Utility
			clearPasswordAccount: passwordAuth.clearPasswordAccount,
		}),
		[
			user,
			isAuthenticated,
			isLoading,
			biometricAuth.isBiometricSupported,
			biometricAuth.isBiometricEnrolled,
			biometricAuth.isBiometricEnabled,
			currentAuthMethod,
			passwordAuth.loginWithPassword,
			githubAuth.loginWithGitHub,
			biometricAuth.loginWithBiometric,
			logout,
			biometricAuth.enableBiometric,
			biometricAuth.disableBiometric,
			passwordAuth.hasPasswordAccount,
			passwordAuth.hasGitHubAccount,
			setSharingInProgressCallback,
			passwordAuth.clearPasswordAccount,
		]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
