// contexts/AuthContext.tsx
import { GITHUB_DISCOVERY, GITHUB_OAUTH_CONFIG } from '@/config/oauth';
import * as AuthSession from 'expo-auth-session';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { AuthMethod, User, AuthContextType } from '@/types/types';
import { useToast } from './ToastContext';

// Storage Keys - Separate for each auth method
const PASSWORD_USER_KEY = 'password_user_data';
const GITHUB_USER_KEY = 'github_user_data';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const CURRENT_AUTH_METHOD_KEY = 'current_auth_method';

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
	const { showToast } = useToast();
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
			// Don't force logout if OAuth or sharing is in progress
			if (isOAuthInProgress) {
				return;
			}
			if (isSharingInProgress || sharingInProgressRef.current) {
				// Reset the ref when we detect sharing was in progress
				sharingInProgressRef.current = false;
				return;
			}
			forceLogoutOnBackground();
		}

		appState.current = nextAppState;
	}, [isOAuthInProgress, isSharingInProgress, forceLogoutOnBackground]);

	// Monitor app state changes - CRITICAL for "always show login" requirement
	useEffect(() => {
		const subscription = AppState.addEventListener('change', handleAppStateChange);
		return () => subscription.remove();
	}, [handleAppStateChange]);


	const checkBiometricCapabilities = useCallback(async () => {
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
		} catch {
			showToast('Failed to check biometric capabilities', 3000);
		} finally {
			setIsLoading(false);
		}
	}, [showToast]);

	// Restore authentication state from SecureStore
	const restoreAuthState = useCallback(async () => {
		try {
			// Get the current auth method
			const currentAuthMethod = await SecureStore.getItemAsync(CURRENT_AUTH_METHOD_KEY);

			if (!currentAuthMethod) {
				return;
			}

			// Get user data based on auth method
			const storageKey = currentAuthMethod === 'password' ? PASSWORD_USER_KEY : GITHUB_USER_KEY;
			const storedUserData = await SecureStore.getItemAsync(storageKey);

			if (storedUserData) {
				const credentials = JSON.parse(storedUserData);

				// Create user object for state (fetch full data if needed)
				let user: User;

				if (currentAuthMethod === 'password') {
					// For password users, we have minimal data
					user = {
						id: `pwd_${Date.now()}`,
						email: `${credentials.username}@example.com`, // Reconstruct email
						username: credentials.username,
						authMethod: 'password',
						hashedPassword: credentials.hashedPassword,
					};
				} else {
					// For GitHub users, fetch full data from GitHub API
					// Note: Using manual fetch here for initialization, but useFetch hook is available for components
					try {
						const response = await fetch('https://api.github.com/user', {
							headers: {
								Authorization: `Bearer ${credentials.githubToken || ''}`,
								Accept: 'application/json',
							},
						});

						if (response.ok) {
							const githubUser = await response.json();
							user = {
								id: `gh_${githubUser.id}`,
								email: githubUser.email || `${credentials.username}@github.com`,
								username: githubUser.login,
								authMethod: 'github',
								githubToken: credentials.githubToken,
								avatarUrl: githubUser.avatar_url,
								githubData: githubUser,
							};
						} else {
							// Fallback to minimal data
							user = {
								id: `gh_${Date.now()}`,
								email: `${credentials.username}@github.com`,
								username: credentials.username,
								authMethod: 'github',
							};
						}
					} catch {
						// Fallback to minimal data
						user = {
							id: `gh_${Date.now()}`,
							email: `${credentials.username}@github.com`,
							username: credentials.username,
							authMethod: 'github',
						};
					}
				}

				setUser(user);
				setIsAuthenticated(true);
				setCurrentAuthMethod(currentAuthMethod as AuthMethod);
			}
		} catch {
			showToast('Failed to restore authentication state', 3000);
		}
	}, [showToast]);

	// Check biometric capabilities and restore auth state on mount
	useEffect(() => {
		checkBiometricCapabilities();
		restoreAuthState();
	}, [checkBiometricCapabilities, restoreAuthState]);

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

			// Check if a password account already exists
			const existingUserData = await SecureStore.getItemAsync(PASSWORD_USER_KEY);

			if (existingUserData) {
				// User exists - validate credentials
				const userCredentials = JSON.parse(existingUserData);
				const hashedPassword = await hashPassword(password);

				// Check if username and password match
				if (userCredentials.username !== normalizedEmail.split('@')[0] || userCredentials.hashedPassword !== hashedPassword) {
					throw new Error('Invalid email or password');
				}

				// Credentials are correct - login
				await SecureStore.setItemAsync(CURRENT_AUTH_METHOD_KEY, 'password');

				// Create user object for state (not stored)
				const user: User = {
					id: `pwd_${Date.now()}`,
					email: normalizedEmail,
					username: userCredentials.username,
					authMethod: 'password',
					hashedPassword: userCredentials.hashedPassword,
				};

				setUser(user);
				setIsAuthenticated(true);
				setCurrentAuthMethod('password');

				// Small delay to ensure state is updated
				await new Promise(resolve => setTimeout(resolve, 100));

				router.replace('/(tabs)');
			} else {
				// First time login - create and store user
				const hashedPassword = await hashPassword(password);

				const userCredentials = {
					username: normalizedEmail.split('@')[0], // Use email prefix as username
					hashedPassword: hashedPassword,
				};

				// Store minimal user data
				await SecureStore.setItemAsync(PASSWORD_USER_KEY, JSON.stringify(userCredentials));
				await SecureStore.setItemAsync(CURRENT_AUTH_METHOD_KEY, 'password');

				// Create user object for state (not stored)
				const user: User = {
					id: `pwd_${Date.now()}`,
					email: normalizedEmail,
					username: userCredentials.username,
					authMethod: 'password',
					hashedPassword: userCredentials.hashedPassword,
				};

				setUser(user);
				setIsAuthenticated(true);
				setCurrentAuthMethod('password');

				// Small delay to ensure state is updated
				await new Promise(resolve => setTimeout(resolve, 100));

				router.replace('/(tabs)');
			}

			// Show biometric setup prompt after successful login
			if (isBiometricSupported && isBiometricEnrolled && !isBiometricEnabled) {
				// Add a longer delay to ensure authentication state is fully updated
				setTimeout(() => {
					// Note: Alert will be shown in login.tsx's handlePasswordAuth
				}, 2000);
			}
		} catch (error) {
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

			// Store minimal GitHub user data
			const githubCredentials = {
				username: githubUser.login,
				githubToken: access_token,
			};

			await SecureStore.setItemAsync(GITHUB_USER_KEY, JSON.stringify(githubCredentials));
			await SecureStore.setItemAsync(CURRENT_AUTH_METHOD_KEY, 'github');

			setUser(newUser);
			setIsAuthenticated(true);
			setCurrentAuthMethod('github');

			// Small delay to ensure state and storage are updated
			await new Promise(resolve => setTimeout(resolve, 500));

			// Clear OAuth in progress flag
			setIsOAuthInProgress(false);

			router.replace('/(tabs)');
		} catch {
			showToast('GitHub authentication failed', 3000);
			setIsLoading(false);
			setIsOAuthInProgress(false);
		}
	}, [request, showToast]);

	// Handle OAuth response
	useEffect(() => {
		if (response?.type === 'success') {
			handleGitHubAuthSuccess(response.params.code);
		} else if (response?.type === 'error') {
			console.error('❌ OAuth error:', response.error);
			setIsLoading(false);
			setIsOAuthInProgress(false);
		} else if (response?.type === 'cancel') {
			setIsLoading(false);
			setIsOAuthInProgress(false);
		}
	}, [response, handleGitHubAuthSuccess, showToast]);



	// Login with GitHub (completely separate from password)
	const loginWithGitHub = async () => {
		try {
			setIsLoading(true);
			setIsOAuthInProgress(true);

			if (!request) {
				setIsLoading(false);
				setIsOAuthInProgress(false);
				return;
			}

			const result = await promptAsync();

			if (result.type === 'success') {
				// The success handling is done in the useEffect
				return;
			} else {
				setIsLoading(false);
				setIsOAuthInProgress(false);
				return;
			}
		} catch {
			showToast('GitHub login failed', 3000);
			setIsLoading(false);
			setIsOAuthInProgress(false);
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
		} catch {
			showToast('Biometric authentication failed', 3000);
			return false;
		}
	};

	// Enable biometric authentication
	const enableBiometric = async (): Promise<boolean> => {
		try {
			if (!isBiometricSupported || !isBiometricEnrolled) {
				return false;
			}

			// Check if user is authenticated by looking at stored data instead of React state
			const currentAuthMethod = await SecureStore.getItemAsync(CURRENT_AUTH_METHOD_KEY);

			if (!currentAuthMethod) {
				// Wait a bit and try again in case storage is still in progress
				await new Promise(resolve => setTimeout(resolve, 1000));
				const retryAuthMethod = await SecureStore.getItemAsync(CURRENT_AUTH_METHOD_KEY);

				if (!retryAuthMethod) {
					throw new Error('Please login first to enable biometric authentication');
				}
			}

			const storageKey = currentAuthMethod === 'password' ? PASSWORD_USER_KEY : GITHUB_USER_KEY;
			const storedUserData = await SecureStore.getItemAsync(storageKey);

			if (!storedUserData) {
				// Wait a bit and try again in case storage is still in progress
				await new Promise(resolve => setTimeout(resolve, 1000));
				const retryUserData = await SecureStore.getItemAsync(storageKey);

				if (!retryUserData) {
					throw new Error('Please login first to enable biometric authentication');
				}
			}

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
		} catch {
			showToast('Failed to enable biometric authentication', 3000);
			return false;
		}
	};

	// Disable biometric authentication
	const disableBiometric = async () => {
		try {
			await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
			setIsBiometricEnabled(false);
		} catch {
			showToast('Failed to disable biometric authentication', 3000);
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

			// Force refresh the login screen to reload biometric state
			// This ensures the biometric state is properly reloaded from SecureStore
			setTimeout(async () => {
				// Re-initialize authentication state to reload biometric capabilities
				await checkBiometricCapabilities();
				router.replace('/login');
			}, 200);
		} catch {
			showToast('Logout failed', 3000);
		}
	};

	const setSharingInProgress = (inProgress: boolean) => {
		setIsSharingInProgress(inProgress);
		sharingInProgressRef.current = inProgress;
	};

	// Clear stored password account (useful for testing/resetting)
	const clearPasswordAccount = async () => {
		try {
			await SecureStore.deleteItemAsync(PASSWORD_USER_KEY);
		} catch {
			showToast('Failed to clear account data', 3000);
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