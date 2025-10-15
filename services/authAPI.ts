import axios from "axios";
import { GITHUB_OAUTH_CONFIG } from "../config/oauth";
import { GitHubTokenResponse, GitHubUser } from '@/types/types';

export class AuthAPI {
  // Exchange OAuth code for access token
  static async exchangeCodeForToken(
    code: string,
    codeVerifier?: string
  ): Promise<GitHubTokenResponse> {
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

    if (!response.data.access_token) {
      throw new Error(
        `Token exchange failed: ${JSON.stringify(response.data)}`
      );
    }

    return response.data;
  }

  // Get user information with access token
  static async getUserInfo(accessToken: string): Promise<GitHubUser> {
    const response = await axios.get<GitHubUser>(
      GITHUB_OAUTH_CONFIG.userInfoEndpoint,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    return response.data;
  }
}
