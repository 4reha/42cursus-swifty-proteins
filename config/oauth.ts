import { makeRedirectUri } from "expo-auth-session";

export const GITHUB_OAUTH_CONFIG = {
  clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || "",
  clientSecret: process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET || "",

  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  userInfoEndpoint: "https://api.github.com/user",

  scopes: ["user:email", "read:user"],

  redirectUri: makeRedirectUri({
    scheme: "ft-proteins",
    path: "oauth",
  }),
};

// Validation
if (!GITHUB_OAUTH_CONFIG.clientId || !GITHUB_OAUTH_CONFIG.clientSecret) {
  console.warn(
    "⚠️  GitHub OAuth credentials not found in environment variables"
  );
}

console.log("OAuth Redirect URI:", GITHUB_OAUTH_CONFIG.redirectUri);
