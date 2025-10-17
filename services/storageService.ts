/**
 * Storage Service
 * Handles all SecureStore operations with type safety
 */

import { STORAGE_KEYS } from "@/constants/storage";
import { AuthMethod, User } from "@/types/auth.types";
import { logger } from "@/utils/logger";
import * as SecureStore from "expo-secure-store";

/**
 * Generic storage operations
 */
export class StorageService {
  /**
   * Store a value in SecureStore
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
      logger.storage(`Stored item: ${key}`);
    } catch (error) {
      logger.error(`Failed to store item: ${key}`, error);
      throw error;
    }
  }

  /**
   * Get a value from SecureStore
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      logger.storage(
        `Retrieved item: ${key} - ${value ? "found" : "not found"}`
      );
      return value;
    } catch (error) {
      logger.error(`Failed to retrieve item: ${key}`, error);
      return null;
    }
  }

  /**
   * Delete a value from SecureStore
   */
  static async deleteItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
      logger.storage(`Deleted item: ${key}`);
    } catch (error) {
      logger.error(`Failed to delete item: ${key}`, error);
      throw error;
    }
  }

  /**
   * Store JSON data
   */
  static async setJSON<T>(key: string, data: T): Promise<void> {
    const jsonString = JSON.stringify(data);
    await this.setItem(key, jsonString);
  }

  /**
   * Get JSON data
   */
  static async getJSON<T>(key: string): Promise<T | null> {
    const jsonString = await this.getItem(key);
    if (!jsonString) return null;

    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      logger.error(`Failed to parse JSON from ${key}`, error);
      return null;
    }
  }
}

/**
 * User storage operations
 */
export class UserStorageService {
  /**
   * Get list of all registered password user emails
   */
  private static async getPasswordUsersList(): Promise<string[]> {
    const list = await StorageService.getJSON<string[]>(
      STORAGE_KEYS.PASSWORD_USERS_LIST
    );
    return list || [];
  }

  /**
   * Add email to password users list
   */
  private static async addToPasswordUsersList(email: string): Promise<void> {
    const list = await this.getPasswordUsersList();
    if (!list.includes(email)) {
      list.push(email);
      await StorageService.setJSON(STORAGE_KEYS.PASSWORD_USERS_LIST, list);
    }
  }

  /**
   * Remove email from password users list
   */
  private static async removeFromPasswordUsersList(
    email: string
  ): Promise<void> {
    const list = await this.getPasswordUsersList();
    const filtered = list.filter((e) => e !== email);
    await StorageService.setJSON(STORAGE_KEYS.PASSWORD_USERS_LIST, filtered);
  }

  /**
   * Sanitize email for use as a storage key
   * SecureStore only allows alphanumeric, ".", "-", and "_"
   */
  private static sanitizeEmailForKey(email: string): string {
    return email.replaceAll(/[^a-zA-Z0-9._-]/g, "_");
  }

  /**
   * Get storage key for a specific password user
   */
  private static getPasswordUserKey(email: string): string {
    const sanitizedEmail = this.sanitizeEmailForKey(email);
    return `${STORAGE_KEYS.PASSWORD_USER_PREFIX}${sanitizedEmail}`;
  }

  /**
   * Store user data based on auth method
   */
  static async storeUser(user: User): Promise<void> {
    if (user.authMethod === "password") {
      // Store individual password user
      const userKey = this.getPasswordUserKey(user.email);
      await StorageService.setJSON(userKey, user);
      await this.addToPasswordUsersList(user.email);
      logger.storage(`Stored password user: ${user.email}`);
    } else {
      // Store GitHub user (single user)
      await StorageService.setJSON(STORAGE_KEYS.GITHUB_USER, user);
      logger.storage(`Stored GitHub user: ${user.username}`);
    }

    // Update current auth method and user
    await StorageService.setItem(
      STORAGE_KEYS.CURRENT_AUTH_METHOD,
      user.authMethod
    );
    await StorageService.setItem(STORAGE_KEYS.CURRENT_USER_EMAIL, user.email);
  }

  /**
   * Get a specific password user by email
   */
  static async getPasswordUserByEmail(email: string): Promise<User | null> {
    const userKey = this.getPasswordUserKey(email);
    return await StorageService.getJSON<User>(userKey);
  }

  /**
   * Get user data for a specific auth method
   */
  static async getUserByMethod(method: AuthMethod): Promise<User | null> {
    if (method === "password") {
      // Get the current password user's email
      const currentEmail = await StorageService.getItem(
        STORAGE_KEYS.CURRENT_USER_EMAIL
      );
      if (currentEmail) {
        return await this.getPasswordUserByEmail(currentEmail);
      }
      return null;
    } else {
      // Get GitHub user
      return await StorageService.getJSON<User>(STORAGE_KEYS.GITHUB_USER);
    }
  }

  /**
   * Get current auth method
   */
  static async getCurrentAuthMethod(): Promise<AuthMethod | null> {
    const method = await StorageService.getItem(
      STORAGE_KEYS.CURRENT_AUTH_METHOD
    );
    return method as AuthMethod | null;
  }

  /**
   * Get the last authenticated user
   */
  static async getLastUser(): Promise<User | null> {
    const method = await this.getCurrentAuthMethod();
    if (!method) return null;
    return await this.getUserByMethod(method);
  }

  /**
   * Check if user exists for a specific auth method
   */
  static async hasUser(method: AuthMethod): Promise<boolean> {
    if (method === "password") {
      const list = await this.getPasswordUsersList();
      return list.length > 0;
    } else {
      const user = await StorageService.getJSON<User>(STORAGE_KEYS.GITHUB_USER);
      return user !== null;
    }
  }

  /**
   * Check if a specific password user exists
   */
  static async hasPasswordUser(email: string): Promise<boolean> {
    const user = await this.getPasswordUserByEmail(email);
    return user !== null;
  }

  /**
   * Delete user data for a specific auth method
   */
  static async deleteUser(method: AuthMethod): Promise<void> {
    if (method === "password") {
      // Delete current password user
      const currentEmail = await StorageService.getItem(
        STORAGE_KEYS.CURRENT_USER_EMAIL
      );
      if (currentEmail) {
        const userKey = this.getPasswordUserKey(currentEmail);
        await StorageService.deleteItem(userKey);
        await this.removeFromPasswordUsersList(currentEmail);
        logger.storage(`Deleted password user: ${currentEmail}`);
      }
    } else {
      // Delete GitHub user
      await StorageService.deleteItem(STORAGE_KEYS.GITHUB_USER);
      logger.storage(`Deleted GitHub user data`);
    }
  }

  /**
   * Delete a specific password user by email
   */
  static async deletePasswordUser(email: string): Promise<void> {
    const userKey = this.getPasswordUserKey(email);
    await StorageService.deleteItem(userKey);
    await this.removeFromPasswordUsersList(email);
    logger.storage(`Deleted password user: ${email}`);
  }

  /**
   * Clear all user data
   */
  static async clearAllUsers(): Promise<void> {
    // Delete all password users
    const passwordUsers = await this.getPasswordUsersList();
    for (const email of passwordUsers) {
      const userKey = this.getPasswordUserKey(email);
      await StorageService.deleteItem(userKey);
    }
    await StorageService.deleteItem(STORAGE_KEYS.PASSWORD_USERS_LIST);

    // Delete GitHub user
    await StorageService.deleteItem(STORAGE_KEYS.GITHUB_USER);
    await StorageService.deleteItem(STORAGE_KEYS.CURRENT_AUTH_METHOD);
    await StorageService.deleteItem(STORAGE_KEYS.CURRENT_USER_EMAIL);
    logger.storage("Cleared all user data");
  }
}

/**
 * Biometric settings storage
 */
export class BiometricStorageService {
  /**
   * Check if biometric is enabled
   */
  static async isEnabled(): Promise<boolean> {
    const value = await StorageService.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    return value === "true";
  }

  /**
   * Enable biometric authentication
   */
  static async enable(): Promise<void> {
    await StorageService.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, "true");
    logger.storage("Biometric authentication enabled");
  }

  /**
   * Disable biometric authentication
   */
  static async disable(): Promise<void> {
    await StorageService.deleteItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    logger.storage("Biometric authentication disabled");
  }
}
