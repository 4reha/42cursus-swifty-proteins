/**
 * Storage keys for SecureStore
 * Centralized to avoid typos and inconsistencies
 */

export const STORAGE_KEYS = {
  PASSWORD_USER: "password_user_data",
  GITHUB_USER: "github_user_data",
  BIOMETRIC_ENABLED: "biometric_enabled",
  CURRENT_AUTH_METHOD: "current_auth_method",
  FAVORITES: "favorite_proteins",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
