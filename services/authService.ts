/**
 * Authentication Service
 * Core authentication business logic
 */

import { GITHUB_DISCOVERY, GITHUB_OAUTH_CONFIG } from "@/config/oauth";
import { AuthMethod, GitHubTokenResponse, User } from "@/types/auth.types";
import { logger } from "@/utils/logger";
import { normalizeEmail } from "@/utils/validation";
import { BiometricService } from "./biometricService";
import { OAuthService } from "./oauthService";
import { BiometricStorageService, UserStorageService } from "./storageService";

export class AuthService {
  /**
   * Simple password hashing (NOT SECURE - for demo only)
   * In production, use a proper backend with bcrypt/argon2
   */
  private static hashPassword(password: string): string {
    return btoa(password + "salt_key_swifty_protein");
  }

  /**
   * Verify password against stored hash
   */
  private static verifyPassword(
    password: string,
    hashedPassword: string
  ): boolean {
    return this.hashPassword(password) === hashedPassword;
  }

  /**
   * Create a new password-based user account
   */
  static async createPasswordAccount(
    email: string,
    password: string
  ): Promise<User> {
    const normalizedEmail = normalizeEmail(email);

    logger.auth("Creating password account");

    const user: User = {
      id: `pwd_${Date.now()}`,
      email: normalizedEmail,
      username: normalizedEmail.split("@")[0],
      authMethod: "password",
      hashedPassword: this.hashPassword(password),
    };

    await UserStorageService.storeUser(user);
    logger.success("Password account created");

    return user;
  }

  /**
   * Login with email and password
   */
  static async loginWithPassword(
    email: string,
    password: string
  ): Promise<User> {
    const normalizedEmail = normalizeEmail(email);
    logger.auth(`Password login attempt: ${normalizedEmail}`);

    // Check if account exists
    const existingUser = await UserStorageService.getUserByMethod("password");

    if (existingUser) {
      // Verify existing account
      if (existingUser.email !== normalizedEmail) {
        throw new Error("Invalid email or password");
      }

      if (
        !existingUser.hashedPassword ||
        !this.verifyPassword(password, existingUser.hashedPassword)
      ) {
        throw new Error("Invalid email or password");
      }

      logger.success("Password login successful (existing account)");
      return existingUser;
    } else {
      // Create new account
      logger.info("No existing account, creating new one");
      return await this.createPasswordAccount(normalizedEmail, password);
    }
  }

  /**
   * Process GitHub OAuth authentication
   */
  static async loginWithGitHub(
    code: string,
    codeVerifier?: string
  ): Promise<User> {
    logger.auth("Processing GitHub authentication...");

    // Exchange code for token
    const tokenBody: any = {
      client_id: GITHUB_OAUTH_CONFIG.clientId,
      client_secret: GITHUB_OAUTH_CONFIG.clientSecret,
      code,
    };

    if (codeVerifier) {
      tokenBody.code_verifier = codeVerifier;
    }

    const tokenResponse = await fetch(GITHUB_DISCOVERY.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(tokenBody),
    });

    const tokenData: GitHubTokenResponse = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(
        tokenData.error_description || "GitHub authentication failed"
      );
    }

    const { access_token } = tokenData;

    // Get user info from GitHub
    const userResponse = await fetch(GITHUB_OAUTH_CONFIG.userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/json",
      },
    });

    const githubUser = await userResponse.json();

    // Get user's email if not public
    let userEmail = githubUser.email;
    if (!userEmail) {
      const email = await OAuthService.getUserEmail(access_token);
      userEmail = email || `${githubUser.login}@github.com`;
    }

    // Fetch additional GitHub data
    const { repos, organizations, starred } =
      await OAuthService.fetchAdditionalGitHubData(access_token);

    const user: User = {
      id: `gh_${githubUser.id}`,
      email: userEmail,
      username: githubUser.login,
      authMethod: "github",
      githubToken: access_token,
      avatarUrl: githubUser.avatar_url,
      githubData: {
        ...githubUser,
        recent_repos: repos,
        organizations: organizations,
        starred_repos: starred,
      },
    };

    await UserStorageService.storeUser(user);
    logger.success("GitHub login completed");

    return user;
  }

  /**
   * Login with biometric authentication
   */
  static async loginWithBiometric(): Promise<User> {
    logger.auth("Attempting biometric login");

    // Check if biometric is available
    const isAvailable = await BiometricService.isAvailable();
    if (!isAvailable) {
      throw new Error("Biometric authentication not available");
    }

    // Check if biometric is enabled
    const isEnabled = await BiometricStorageService.isEnabled();
    if (!isEnabled) {
      throw new Error(
        "Biometric authentication not enabled. Please login first."
      );
    }

    // Authenticate with biometrics
    const result = await BiometricService.authenticate(
      "Authenticate to access Swifty Protein"
    );

    if (!result) {
      throw new Error("Biometric authentication failed");
    }

    // Get the last authenticated user
    const user = await UserStorageService.getLastUser();

    if (!user) {
      throw new Error("No user data found");
    }

    logger.success("Biometric login successful");
    return user;
  }

  /**
   * Enable biometric authentication for current user
   */
  static async enableBiometric(): Promise<void> {
    logger.auth("Enabling biometric authentication");

    // Check if user is logged in
    const currentMethod = await UserStorageService.getCurrentAuthMethod();
    if (!currentMethod) {
      throw new Error("Please login first to enable biometric authentication");
    }

    const user = await UserStorageService.getUserByMethod(currentMethod);
    if (!user) {
      throw new Error("Please login first to enable biometric authentication");
    }

    // Test biometric authentication
    const result = await BiometricService.authenticate(
      "Enable biometric authentication"
    );

    if (!result) {
      throw new Error("Biometric authentication failed");
    }

    await BiometricStorageService.enable();
    logger.success("Biometric authentication enabled");
  }

  /**
   * Disable biometric authentication
   */
  static async disableBiometric(): Promise<void> {
    await BiometricStorageService.disable();
    logger.info("Biometric authentication disabled");
  }

  /**
   * Check if a user exists for a specific auth method
   */
  static async hasAccount(method: AuthMethod): Promise<boolean> {
    return await UserStorageService.hasUser(method);
  }

  /**
   * Clear password account data
   */
  static async clearPasswordAccount(): Promise<void> {
    await UserStorageService.deleteUser("password");
    logger.info("Password account cleared");
  }

  /**
   * Logout and clear session
   */
  static async logout(): Promise<void> {
    logger.auth("Logging out");
    // Note: We keep user data for biometric re-login
    // Only clear the biometric enabled flag if needed
    await BiometricStorageService.disable();
    logger.success("Logged out successfully");
  }
}
