/**
 * Navigation related constants and types
 */

export const ROUTES = {
  INDEX: "/",
  LOGIN: "/login",
  OAUTH: "/oauth",
  TABS: "/(tabs)",
  HOME: "/(tabs)/",
  EXPLORE: "/(tabs)/explore",
  FAVORITES: "/(tabs)/favorites",
  EXPLORE_DETAIL: "/explore/[id]",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export interface ExploreDetailParams {
  id: string;
}
