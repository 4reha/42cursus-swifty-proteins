/**
 * Storage keys for SecureStore
 * Centralized to avoid typos and inconsistencies
 */

export const STORAGE_KEYS = {
  PASSWORD_USER: "password_user_data",
  PASSWORD_USERS_LIST: "password_users_list", // List of all password user emails
  PASSWORD_USER_PREFIX: "pwd_user_", // Prefix for individual password user data
  GITHUB_USER: "github_user_data",
  BIOMETRIC_ENABLED: "biometric_enabled",
  CURRENT_AUTH_METHOD: "current_auth_method",
  CURRENT_USER_EMAIL: "current_user_email",
  FAVORITES: "favorite_proteins",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
