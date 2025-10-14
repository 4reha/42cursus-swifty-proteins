// contexts/AuthContext.tsx
import { GITHUB_DISCOVERY, GITHUB_OAUTH_CONFIG } from '@/config/oauth';
import * as AuthSession from 'expo-auth-session';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// Storage Keys - Separate for each auth method
const PASSWORD_USER_KEY = 'password_user_data';
const GITHUB_USER_KEY = 'github_user_data';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const CURRENT_AUTH_METHOD_KEY = 'current_auth_method';

type AuthMethod = 'password' | 'github';

interface User {
	id: string;
	email: string;
	username: string;
	authMethod: AuthMethod;
	githubToken?: string;
	hashedPassword?: string;
	avatarUrl?: string;
	// Additional GitHub data
	githubData?: {
		name?: string;
		bio?: string;
		location?: string;
		company?: string;
		blog?: string;
		twitter_username?: string;
		public_repos?: number;
		public_gists?: number;
		followers?: number;
		following?: number;
		created_at?: string;
		updated_at?: string;
		hireable?: boolean;
		html_url?: string;
		repos_url?: string;
		organizations_url?: string;
		starred_url?: string;
		subscriptions_url?: string;
		received_events_url?: string;
		events_url?: string;
		type?: string;
		site_admin?: boolean;
		gravatar_id?: string;
		node_id?: string;
		url?: string;
		followers_url?: string;
		following_url?: string;
		gists_url?: string;
		plan?: {
			name: string;
			space: number;
			private_repos: number;
			collaborators: number;
		};
		// Additional fetched data
		recent_repos?: any[];
		organizations?: any[];
		starred_repos?: any[];
	};
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	isBiometricSupported: boolean;
	isBiometricEnrolled: boolean;
	isBiometricEnabled: boolean;
	currentAuthMethod: AuthMethod | null;

	// Auth methods
	loginWithPassword: (email: string, password: string) => Promise<void>;
	loginWithGitHub: () => Promise<void>;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isBiometricSupported, setIsBiometricSupported] = useState(false);
	const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);
	const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
	const [currentAuthMethod, setCurrentAuthMethod] = useState<AuthMethod | null>(null);
	const [isOAuthInProgress, setIsOAuthInProgress] = useState(false);
	const [isSharingInProgress, setIsSharingInProgress] = useState(false);
	const sharingInProgressRef = useRef(false);

	const appState = useRef(AppState.currentState);

	// GitHub OAuth Configuration is now imported from config/oauth.ts

	const forceLogoutOnBackground = useCallback(async () => {

		// Clear authentication state but keep user data for biometric re-login
		setIsAuthenticated(false);

		// Force navigation to login screen
		try {
			router.replace('/login');
		} catch (error) {
			console.error('🔐 [AUTH] Navigation error:', error);
		}
	}, []);

	const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
		// Detect when app comes back from background
		if (
			appState.current.match(/inactive|background/) &&
			nextAppState === 'active'
		) {
			console.log('📱 [APP_STATE] App came to foreground from background/inactive');

			// Don't force logout if OAuth or sharing is in progress
			if (isOAuthInProgress) {
				console.log('📱 [APP_STATE] OAuth in progress - skipping logout');
				return;
			}
			if (isSharingInProgress || sharingInProgressRef.current) {
				console.log('📱 [APP_STATE] Sharing in progress (state or ref) - skipping logout');
				// Reset the ref when we detect sharing was in progress
				sharingInProgressRef.current = false;
				return;
			}
			console.log('📱 [APP_STATE] No special operations in progress - forcing logout');
			forceLogoutOnBackground();
		} else {
			console.log('📱 [APP_STATE] State change not requiring logout check');
		}

		appState.current = nextAppState;
		console.log('📱 [APP_STATE] App state updated to:', nextAppState);
	}, [isOAuthInProgress, isSharingInProgress, forceLogoutOnBackground]);

	// Monitor app state changes - CRITICAL for "always show login" requirement
	useEffect(() => {
		const subscription = AppState.addEventListener('change', handleAppStateChange);
		return () => subscription.remove();
	}, [handleAppStateChange]);


	const checkBiometricCapabilities = async () => {
		try {
			const compatible = await LocalAuthentication.hasHardwareAsync();
			setIsBiometricSupported(compatible);

			if (compatible) {
				const enrolled = await LocalAuthentication.isEnrolledAsync();
				setIsBiometricEnrolled(enrolled);

				// Check if user has enabled biometric
				const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
				setIsBiometricEnabled(enabled === 'true');
			}
		} catch (error) {
			console.error('Error checking biometric capabilities:', error);
		} finally {
			setIsLoading(false);
		}
	};

	// Restore authentication state from SecureStore
	const restoreAuthState = async () => {
		try {
			console.log('🔄 Restoring authentication state...');

			// Get the current auth method
			const currentAuthMethod = await SecureStore.getItemAsync(CURRENT_AUTH_METHOD_KEY);

			if (!currentAuthMethod) {
				console.log('ℹ️ No previous authentication found');
				return;
			}

			// Get user data based on auth method
			const storageKey = currentAuthMethod === 'password' ? PASSWORD_USER_KEY : GITHUB_USER_KEY;
			const storedUserData = await SecureStore.getItemAsync(storageKey);

			if (storedUserData) {
				const storedUser: User = JSON.parse(storedUserData);
				console.log('✅ Found stored user data:', {
					username: storedUser.username,
					authMethod: storedUser.authMethod,
					email: storedUser.email
				});

				setUser(storedUser);
				setIsAuthenticated(true);
				setCurrentAuthMethod(currentAuthMethod as AuthMethod);
				console.log('✅ Authentication state restored successfully');
			} else {
				console.log('ℹ️ No stored user data found');
			}
		} catch (error) {
			console.error('❌ Error restoring authentication state:', error);
		}
	};

	// Check biometric capabilities and restore auth state on mount
	useEffect(() => {
		checkBiometricCapabilities();
		restoreAuthState();
	}, []);

	// Hash password (simple implementation - use bcrypt in production)
	const hashPassword = async (password: string): Promise<string> => {
		// In production, use proper hashing like bcrypt
		// For now, simple hash (NOT SECURE - just for demo)
		return btoa(password + 'salt_key_swifty_protein');
	};


	// Check if password account exists
	const hasPasswordAccount = async (): Promise<boolean> => {
		try {
			const userData = await SecureStore.getItemAsync(PASSWORD_USER_KEY);
			return userData !== null;
		} catch {
			return false;
		}
	};

	// Check if GitHub account exists
	const hasGitHubAccount = async (): Promise<boolean> => {
		try {
			const userData = await SecureStore.getItemAsync(GITHUB_USER_KEY);
			return userData !== null;
		} catch {
			return false;
		}
	};



	const loginWithPassword = async (email: string, password: string) => {
		try {
			setIsLoading(true);

			// Normalize email (trim and lowercase)
			const normalizedEmail = email.trim().toLowerCase();
			console.log('🔐 Login attempt with email:', normalizedEmail);

			// Check if a password account already exists
			const existingUserData = await SecureStore.getItemAsync(PASSWORD_USER_KEY);

			if (existingUserData) {
				// User exists - validate credentials
				console.log('🔍 Existing password account found, validating credentials...');
				const existingUser: User = JSON.parse(existingUserData);
				const hashedPassword = await hashPassword(password);

				console.log('📊 Credential comparison:', {
					storedEmail: existingUser.email,
					providedEmail: normalizedEmail,
					emailMatch: existingUser.email === normalizedEmail,
					passwordMatch: existingUser.hashedPassword === hashedPassword
				});

				// Check if email and password match
				if (existingUser.email !== normalizedEmail || existingUser.hashedPassword !== hashedPassword) {
					console.log('❌ Invalid credentials provided');
					throw new Error('Invalid email or password');
				}

				// Credentials are correct - login
				console.log('✅ Credentials validated successfully');
				await SecureStore.setItemAsync(CURRENT_AUTH_METHOD_KEY, 'password');
				setUser(existingUser);
				setIsAuthenticated(true);
				setCurrentAuthMethod('password');
				console.log('✅ Password login completed, authentication state set to true');

				// Small delay to ensure state is updated
				await new Promise(resolve => setTimeout(resolve, 100));

				router.replace('/(tabs)');
			} else {
				// First time login - create and store user
				console.log('📝 First time password login, creating new account...');
				const hashedPassword = await hashPassword(password);

				const user: User = {
					id: `pwd_${Date.now()}`,
					email: normalizedEmail,
					username: normalizedEmail.split('@')[0], // Use email prefix as username
					authMethod: 'password',
					hashedPassword: hashedPassword,
				};

				console.log('💾 Storing new user with email:', normalizedEmail);

				// Store user data
				await SecureStore.setItemAsync(PASSWORD_USER_KEY, JSON.stringify(user));
				await SecureStore.setItemAsync(CURRENT_AUTH_METHOD_KEY, 'password');

				setUser(user);
				setIsAuthenticated(true);
				setCurrentAuthMethod('password');
				console.log('✅ Password account created and login completed, authentication state set to true');

				// Small delay to ensure state is updated
				await new Promise(resolve => setTimeout(resolve, 100));

				router.replace('/(tabs)');
			}

			// Show biometric setup prompt after successful login
			if (isBiometricSupported && isBiometricEnrolled && !isBiometricEnabled) {
				console.log('🔐 Biometric setup conditions met:', {
					isBiometricSupported,
					isBiometricEnrolled,
					isBiometricEnabled
				});

				console.log('🔐 Current auth state before prompt:', {
					isBiometricSupported,
					isBiometricEnrolled,
					isBiometricEnabled
				});

				// Add a longer delay to ensure authentication state is fully updated
				setTimeout(() => {
					console.log('⏰ Showing biometric setup prompt after delay');
					// Note: Alert will be shown in login.tsx's handlePasswordAuth
				}, 2000);
			} else {
				console.log('ℹ️ Biometric setup not needed:', {
					isBiometricSupported,
					isBiometricEnrolled,
					isBiometricEnabled
				});
			}
		} catch (error) {
			console.log('⚠️ Login error:', error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

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

	// Handle GitHub authentication success
	const handleGitHubAuthSuccess = useCallback(async (code: string) => {
		try {
			console.log('🔄 Processing GitHub authentication...');

			// Exchange code for token
			// If the authorization request used PKCE (code_challenge), include the code_verifier here.
			const tokenBody: any = {
				client_id: GITHUB_OAUTH_CONFIG.clientId,
				client_secret: GITHUB_OAUTH_CONFIG.clientSecret,
				code,
			};
			// include PKCE verifier when available from the request object
			if (request && (request as any).codeVerifier) {
				tokenBody.code_verifier = (request as any).codeVerifier;
			}
			const tokenResponse = await fetch(GITHUB_DISCOVERY.tokenEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify(tokenBody),
			});

			const tokenData = await tokenResponse.json();

			if (tokenData.error) {
				throw new Error(tokenData.error_description || 'GitHub authentication failed');
			}

			const { access_token } = tokenData;

			// Get user info from GitHub
			const userResponse = await fetch(GITHUB_OAUTH_CONFIG.userInfoEndpoint, {
				headers: {
					Authorization: `Bearer ${access_token}`,
					Accept: 'application/json',
				},
			});

			const githubUser = await userResponse.json();

			// Get user's email if not public
			let userEmail = githubUser.email;
			if (!userEmail) {
				const emailResponse = await fetch('https://api.github.com/user/emails', {
					headers: {
						Authorization: `Bearer ${access_token}`,
						Accept: 'application/json',
					},
				});
				const emails = await emailResponse.json();
				const primaryEmail = emails.find((e: any) => e.primary);
				userEmail = primaryEmail?.email || `${githubUser.login}@github.com`;
			}

			// Fetch additional GitHub data
			const [reposResponse, orgsResponse, starredResponse] = await Promise.all([
				fetch('https://api.github.com/user/repos?per_page=5&sort=updated', {
					headers: {
						Authorization: `Bearer ${access_token}`,
						Accept: 'application/json',
					},
				}).catch(() => null),
				fetch('https://api.github.com/user/orgs', {
					headers: {
						Authorization: `Bearer ${access_token}`,
						Accept: 'application/json',
					},
				}).catch(() => null),
				fetch('https://api.github.com/user/starred?per_page=5', {
					headers: {
						Authorization: `Bearer ${access_token}`,
						Accept: 'application/json',
					},
				}).catch(() => null),
			]);

			const repos = reposResponse?.ok ? await reposResponse.json() : [];
			const orgs = orgsResponse?.ok ? await orgsResponse.json() : [];
			const starred = starredResponse?.ok ? await starredResponse.json() : [];

			const newUser: User = {
				id: `gh_${githubUser.id}`,
				email: userEmail,
				username: githubUser.login,
				authMethod: 'github',
				githubToken: access_token,
				avatarUrl: githubUser.avatar_url,
				githubData: {
					...githubUser,
					recent_repos: repos,
					organizations: orgs,
					starred_repos: starred,
				},
			};

			// Store GitHub user data separately
			await SecureStore.setItemAsync(GITHUB_USER_KEY, JSON.stringify(newUser));
			await SecureStore.setItemAsync(CURRENT_AUTH_METHOD_KEY, 'github');

			console.log('💾 Stored GitHub user data and auth method');

			setUser(newUser);
			setIsAuthenticated(true);
			setCurrentAuthMethod('github');
			console.log('✅ GitHub login completed, authentication state set to true');

			// Verify storage was successful
			const storedAuthMethod = await SecureStore.getItemAsync(CURRENT_AUTH_METHOD_KEY);
			const storedUserData = await SecureStore.getItemAsync(GITHUB_USER_KEY);
			console.log('🔍 Storage verification:', {
				authMethod: storedAuthMethod,
				hasUserData: !!storedUserData
			});

			// Small delay to ensure state and storage are updated
			await new Promise(resolve => setTimeout(resolve, 500));

			// Clear OAuth in progress flag
			setIsOAuthInProgress(false);

			router.replace('/(tabs)');
		} catch (error) {
			console.error('GitHub authentication error:', error);
			setIsLoading(false);
			setIsOAuthInProgress(false);
		}
	}, [request]);

	// Handle OAuth response
	useEffect(() => {
		if (response?.type === 'success') {
			console.log('✅ OAuth success - Code received:', response.params.code);
			handleGitHubAuthSuccess(response.params.code);
		} else if (response?.type === 'error') {
			console.error('❌ OAuth error:', response.error);
			setIsLoading(false);
			setIsOAuthInProgress(false);
		} else if (response?.type === 'cancel') {
			console.log('⚠️ OAuth cancelled by user');
			setIsLoading(false);
			setIsOAuthInProgress(false);
		}
	}, [response, handleGitHubAuthSuccess]);



	// Login with GitHub (completely separate from password)
	const loginWithGitHub = async () => {
		try {
			setIsLoading(true);
			setIsOAuthInProgress(true);

			console.log('🔗 Redirect URI:', GITHUB_OAUTH_CONFIG.redirectUri);
			console.log('🔗 Client ID:', GITHUB_OAUTH_CONFIG.clientId);

			if (!request) {
				console.error('❌ OAuth request not ready');
				setIsLoading(false);
				setIsOAuthInProgress(false);
				return;
			}

			const result = await promptAsync();
			console.log('🔐 GitHub login result:', result.type);

			if (result.type === 'success') {
				// The success handling is done in the useEffect
				return;
			} else {
				setIsLoading(false);
				setIsOAuthInProgress(false);
				return;
			}
		} catch (error) {
			console.error('GitHub login error:', error);
			setIsLoading(false);
			setIsOAuthInProgress(false);
			throw error;
		}
	};

	// Login with biometric (uses last auth method)
	const loginWithBiometric = async (): Promise<boolean> => {
		try {
			if (!isBiometricSupported || !isBiometricEnrolled) {
				throw new Error('Biometric authentication not available');
			}

			if (!isBiometricEnabled) {
				throw new Error('Biometric authentication not enabled. Please login first.');
			}

			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: 'Authenticate to access Swifty Protein',
				fallbackLabel: 'Use Password',
				cancelLabel: 'Cancel',
				disableDeviceFallback: false,
			});

			if (result.success) {
				// Get the last used auth method
				const lastAuthMethod = await SecureStore.getItemAsync(CURRENT_AUTH_METHOD_KEY);

				if (!lastAuthMethod) {
					throw new Error('No previous login found');
				}

				// Load user from appropriate storage
				const storageKey = lastAuthMethod === 'password' ? PASSWORD_USER_KEY : GITHUB_USER_KEY;
				const storedUserData = await SecureStore.getItemAsync(storageKey);

				if (!storedUserData) {
					throw new Error('No user data found');
				}

				const storedUser: User = JSON.parse(storedUserData);
				setUser(storedUser);
				setIsAuthenticated(true);
				setCurrentAuthMethod(lastAuthMethod as AuthMethod);

				router.replace('/(tabs)');
				return true;
			}

			return false;
		} catch (error) {
			console.error('Biometric authentication error:', error);
			return false;
		}
	};

	// Enable biometric authentication
	const enableBiometric = async (): Promise<boolean> => {
		try {
			console.log('🔐 enableBiometric called with state:', {
				isAuthenticated,
				isBiometricSupported,
				isBiometricEnrolled,
				isBiometricEnabled,
				user: user ? 'exists' : 'null'
			});

			if (!isBiometricSupported || !isBiometricEnrolled) {
				console.log('❌ Biometric not supported or not enrolled');
				return false;
			}

			// Check if user is authenticated by looking at stored data instead of React state
			const currentAuthMethod = await SecureStore.getItemAsync(CURRENT_AUTH_METHOD_KEY);
			console.log('🔍 Checking stored auth method:', currentAuthMethod);

			if (!currentAuthMethod) {
				console.log('❌ No stored authentication method found');
				// Wait a bit and try again in case storage is still in progress
				await new Promise(resolve => setTimeout(resolve, 1000));
				const retryAuthMethod = await SecureStore.getItemAsync(CURRENT_AUTH_METHOD_KEY);
				console.log('🔍 Retry checking stored auth method:', retryAuthMethod);

				if (!retryAuthMethod) {
					throw new Error('Please login first to enable biometric authentication');
				}
			}

			const storageKey = currentAuthMethod === 'password' ? PASSWORD_USER_KEY : GITHUB_USER_KEY;
			const storedUserData = await SecureStore.getItemAsync(storageKey);
			console.log('🔍 Checking stored user data for key:', storageKey, 'Found:', !!storedUserData);

			if (!storedUserData) {
				console.log('❌ No stored user data found for method:', currentAuthMethod);
				// Wait a bit and try again in case storage is still in progress
				await new Promise(resolve => setTimeout(resolve, 1000));
				const retryUserData = await SecureStore.getItemAsync(storageKey);
				console.log('🔍 Retry checking stored user data:', !!retryUserData);

				if (!retryUserData) {
					throw new Error('Please login first to enable biometric authentication');
				}
			}

			console.log('✅ Found stored authentication data, proceeding with biometric setup');

			// Test biometric authentication
			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: 'Enable biometric authentication',
				fallbackLabel: 'Cancel',
			});

			if (result.success) {
				await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
				setIsBiometricEnabled(true);
				return true;
			}

			return false;
		} catch (error) {
			console.error('Enable biometric error:', error);
			return false;
		}
	};

	// Disable biometric authentication
	const disableBiometric = async () => {
		try {
			await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
			setIsBiometricEnabled(false);
		} catch (error) {
			console.error('Disable biometric error:', error);
		}
	};

	// Logout
	const logout = async () => {
		try {
			setUser(null);
			setIsAuthenticated(false);
			setCurrentAuthMethod(null);
			// Note: We keep user data for biometric re-login
			// Only clear authentication state
			router.replace('/login');
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	const setSharingInProgress = (inProgress: boolean) => {
		console.log('🔐 [AUTH] setSharingInProgress called:', inProgress);
		console.log('🔐 [AUTH] Current sharing state:', isSharingInProgress);
		setIsSharingInProgress(inProgress);
		sharingInProgressRef.current = inProgress;
		console.log('🔐 [AUTH] Sharing state updated to:', inProgress);
		console.log('🔐 [AUTH] Sharing ref updated to:', inProgress);
	};

	// Clear stored password account (useful for testing/resetting)
	const clearPasswordAccount = async () => {
		try {
			console.log('🗑️ Clearing stored password account...');
			await SecureStore.deleteItemAsync(PASSWORD_USER_KEY);
			console.log('✅ Password account cleared successfully');
		} catch (error) {
			console.error('❌ Error clearing password account:', error);
		}
	};

	const value: AuthContextType = {
		user,
		isAuthenticated,
		isLoading,
		isBiometricSupported,
		isBiometricEnrolled,
		isBiometricEnabled,
		currentAuthMethod,
		loginWithPassword,
		loginWithGitHub,
		loginWithBiometric,
		logout,
		enableBiometric,
		disableBiometric,
		hasPasswordAccount,
		hasGitHubAccount,
		setSharingInProgress,
		clearPasswordAccount,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}