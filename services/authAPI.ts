import axios from "axios";
import { GITHUB_OAUTH_CONFIG } from "../config/oauth";

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

export class AuthAPI {
  // Exchange OAuth code for access token
  static async exchangeCodeForToken(
    code: string,
    codeVerifier?: string
  ): Promise<GitHubTokenResponse> {
    console.log("🔄 Processing OAuth token exchange...");

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

    console.log("🔑 Token response status:", response.status);

    if (!response.data.access_token) {
      throw new Error(
        `Token exchange failed: ${JSON.stringify(response.data)}`
      );
    }

    console.log("✅ Access token received");
    return response.data;
  }

  // Get user information with access token
  static async getUserInfo(accessToken: string): Promise<GitHubUser> {
    console.log("🔄 Fetching user information...");

    const response = await axios.get<GitHubUser>(
      GITHUB_OAUTH_CONFIG.userInfoEndpoint,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    console.log("👤 User authenticated:", response.data.login);
    return response.data;
  }
}
