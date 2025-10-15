/**
 * Authentication related types
 */

export type AuthMethod = "password" | "github";

export interface User {
  id: string;
  email: string;
  username: string;
  authMethod: AuthMethod;
  githubToken?: string;
  hashedPassword?: string;
  avatarUrl?: string;
  githubData?: GitHubUserData;
}

export interface GitHubUserData {
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
  plan?: GitHubPlan;
  recent_repos?: any[];
  organizations?: any[];
  starred_repos?: any[];
}

export interface GitHubPlan {
  name: string;
  space: number;
  private_repos: number;
  collaborators: number;
}

export interface BiometricCapabilities {
  isSupported: boolean;
  isEnrolled: boolean;
  biometricType: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentAuthMethod: AuthMethod | null;
}

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  error?: string;
  error_description?: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  [key: string]: any;
}
