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
   * Store user data based on auth method
   */
  static async storeUser(user: User): Promise<void> {
    const key =
      user.authMethod === "password"
        ? STORAGE_KEYS.PASSWORD_USER
        : STORAGE_KEYS.GITHUB_USER;

    await StorageService.setJSON(key, user);
    await StorageService.setItem(
      STORAGE_KEYS.CURRENT_AUTH_METHOD,
      user.authMethod
    );
    logger.storage(`Stored ${user.authMethod} user: ${user.username}`);
  }

  /**
   * Get user data for a specific auth method
   */
  static async getUserByMethod(method: AuthMethod): Promise<User | null> {
    const key =
      method === "password"
        ? STORAGE_KEYS.PASSWORD_USER
        : STORAGE_KEYS.GITHUB_USER;

    return await StorageService.getJSON<User>(key);
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
    const user = await this.getUserByMethod(method);
    return user !== null;
  }

  /**
   * Delete user data for a specific auth method
   */
  static async deleteUser(method: AuthMethod): Promise<void> {
    const key =
      method === "password"
        ? STORAGE_KEYS.PASSWORD_USER
        : STORAGE_KEYS.GITHUB_USER;

    await StorageService.deleteItem(key);
    logger.storage(`Deleted ${method} user data`);
  }

  /**
   * Clear all user data
   */
  static async clearAllUsers(): Promise<void> {
    await StorageService.deleteItem(STORAGE_KEYS.PASSWORD_USER);
    await StorageService.deleteItem(STORAGE_KEYS.GITHUB_USER);
    await StorageService.deleteItem(STORAGE_KEYS.CURRENT_AUTH_METHOD);
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
