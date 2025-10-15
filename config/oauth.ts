import { makeRedirectUri } from "expo-auth-session";

// GitHub OAuth Discovery Document
export const GITHUB_DISCOVERY = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: `https://github.com/settings/connections/applications/${process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID}`,
};

export const GITHUB_OAUTH_CONFIG = {
  clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || "",
  clientSecret: process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET || "",
  scopes: ['user:email', 'read:user', 'read:org', 'repo'],
  redirectUri: makeRedirectUri({
    scheme: 'swiftyprotein',
    path: 'oauth',
  }),
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  userInfoEndpoint: 'https://api.github.com/user',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
};

// Validation
if (!GITHUB_OAUTH_CONFIG.clientId || !GITHUB_OAUTH_CONFIG.clientSecret) {
  console.warn(
    "⚠️  GitHub OAuth credentials not found in environment variables"
  );
}

