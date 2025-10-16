/**
 * Navigation Service
 * Centralized navigation logic
 */

import { ROUTES } from "@/constants/routes";
import { logger } from "@/utils/logger";
import { router } from "expo-router";

export class NavigationService {
  /**
   * Navigate to login screen
   */
  static toLogin(): void {
    try {
      router.replace(ROUTES.LOGIN);
      logger.navigation("Navigated to login");
    } catch (error) {
      logger.error("Navigation to login failed", error);
    }
  }

  /**
   * Navigate to tabs (main app)
   */
  static toTabs(): void {
    try {
      router.replace(ROUTES.TABS);
      logger.navigation("Navigated to tabs");
    } catch (error) {
      logger.error("Navigation to tabs failed", error);
    }
  }

  /**
   * Navigate to explore screen
   */
  static toExplore(): void {
    try {
      router.push(ROUTES.EXPLORE);
      logger.navigation("Navigated to explore");
    } catch (error) {
      logger.error("Navigation to explore failed", error);
    }
  }

  /**
   * Navigate to favorites screen
   */
  static toFavorites(): void {
    try {
      router.push(ROUTES.FAVORITES);
      logger.navigation("Navigated to favorites");
    } catch (error) {
      logger.error("Navigation to favorites failed", error);
    }
  }

  /**
   * Navigate to ligand detail screen
   */
  static toLigandDetail(id: string): void {
    try {
      router.push({
        pathname: ROUTES.EXPLORE_DETAIL,
        params: { id },
      });
      logger.navigation(`Navigated to ligand detail: ${id}`);
    } catch (error) {
      logger.error(`Navigation to ligand detail failed for ${id}`, error);
    }
  }

  /**
   * Go back
   */
  static goBack(): void {
    try {
      if (router.canGoBack()) {
        router.back();
        logger.navigation("Navigated back");
      }
    } catch (error) {
      logger.error("Navigation back failed", error);
    }
  }
}
