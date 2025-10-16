/**
 * OAuth Service
 * Handles GitHub OAuth authentication flow
 */

import { GITHUB_OAUTH_CONFIG } from "@/config/oauth";
import { GitHubTokenResponse, GitHubUser } from "@/types/auth.types";
import { logger } from "@/utils/logger";
import axios from "axios";

export class OAuthService {
  /**
   * Exchange OAuth code for access token
   */
  static async exchangeCodeForToken(
    code: string,
    codeVerifier?: string
  ): Promise<GitHubTokenResponse> {
    logger.oauth("Processing OAuth token exchange...");

    try {
      const response = await axios.post<GitHubTokenResponse>(
        GITHUB_OAUTH_CONFIG.tokenEndpoint,
        {
          client_id: GITHUB_OAUTH_CONFIG.clientId,
          client_secret: GITHUB_OAUTH_CONFIG.clientSecret,
          code: code,
          code_verifier: codeVerifier,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      logger.oauth(`Token response status: ${response.status}`);

      if (!response.data.access_token) {
        throw new Error(
          `Token exchange failed: ${JSON.stringify(response.data)}`
        );
      }

      logger.success("Access token received");
      return response.data;
    } catch (error) {
      logger.error("Token exchange failed", error);
      throw error;
    }
  }

  /**
   * Get user information with access token
   */
  static async getUserInfo(accessToken: string): Promise<GitHubUser> {
    logger.oauth("Fetching user information...");

    try {
      const response = await axios.get<GitHubUser>(
        GITHUB_OAUTH_CONFIG.userInfoEndpoint,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      logger.success(`User authenticated: ${response.data.login}`);
      return response.data;
    } catch (error) {
      logger.error("Failed to fetch user info", error);
      throw error;
    }
  }

  /**
   * Fetch user's primary email
   */
  static async getUserEmail(accessToken: string): Promise<string | null> {
    try {
      const response = await axios.get("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      const emails = response.data;
      const primaryEmail = emails.find((e: any) => e.primary);
      return primaryEmail?.email || null;
    } catch (error) {
      logger.warning("Failed to fetch user email", error);
      return null;
    }
  }

  /**
   * Fetch user's repositories
   */
  static async getUserRepos(
    accessToken: string,
    limit: number = 5
  ): Promise<any[]> {
    try {
      const response = await axios.get("https://api.github.com/user/repos", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        params: {
          sort: "updated",
          per_page: limit,
        },
      });

      return response.data;
    } catch (error) {
      logger.warning("Failed to fetch user repos", error);
      return [];
    }
  }

  /**
   * Fetch user's organizations
   */
  static async getUserOrganizations(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get("https://api.github.com/user/orgs", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      return response.data;
    } catch (error) {
      logger.warning("Failed to fetch user organizations", error);
      return [];
    }
  }

  /**
   * Fetch user's starred repositories
   */
  static async getUserStarred(
    accessToken: string,
    limit: number = 5
  ): Promise<any[]> {
    try {
      const response = await axios.get("https://api.github.com/user/starred", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        params: {
          per_page: limit,
        },
      });

      return response.data;
    } catch (error) {
      logger.warning("Failed to fetch starred repos", error);
      return [];
    }
  }

  /**
   * Fetch all additional GitHub data
   */
  static async fetchAdditionalGitHubData(accessToken: string): Promise<{
    repos: any[];
    organizations: any[];
    starred: any[];
  }> {
    const [repos, organizations, starred] = await Promise.all([
      this.getUserRepos(accessToken),
      this.getUserOrganizations(accessToken),
      this.getUserStarred(accessToken),
    ]);

    return { repos, organizations, starred };
  }
}
