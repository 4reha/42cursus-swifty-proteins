/**
 * Favorites Context
 * Manages favorite proteins/ligands
 */

import { STORAGE_KEYS } from "@/constants/storage";
import { FavoriteProtein } from "@/types/ligand.types";
import { logger } from "@/utils/logger";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface FavoritesContextType {
  favorites: FavoriteProtein[];
  isFavorite: (proteinId: string) => boolean;
  addToFavorites: (protein: FavoriteProtein) => Promise<void>;
  removeFromFavorites: (proteinId: string) => Promise<void>;
  toggleFavorite: (protein: FavoriteProtein) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  const [favorites, setFavorites] = useState<FavoriteProtein[]>([]);

  // Load favorites from storage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await SecureStore.getItemAsync(
        STORAGE_KEYS.FAVORITES
      );
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        setFavorites(parsedFavorites);
        logger.info("Favorites loaded");
      }
    } catch (error) {
      logger.error("Error loading favorites", error);
    }
  };

  const saveFavorites = async (newFavorites: FavoriteProtein[]) => {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(newFavorites)
      );
      setFavorites(newFavorites);
      logger.storage("Favorites saved");
    } catch (error) {
      logger.error("Error saving favorites", error);
    }
  };

  const isFavorite = React.useCallback(
    (proteinId: string): boolean => {
      return favorites.some((fav) => fav.id === proteinId);
    },
    [favorites]
  );

  const addToFavorites = React.useCallback(
    async (protein: FavoriteProtein) => {
      const newFavorites = [...favorites, protein];
      await saveFavorites(newFavorites);
    },
    [favorites]
  );

  const removeFromFavorites = React.useCallback(
    async (proteinId: string) => {
      const newFavorites = favorites.filter((fav) => fav.id !== proteinId);
      await saveFavorites(newFavorites);
    },
    [favorites]
  );

  const toggleFavorite = React.useCallback(
    async (protein: FavoriteProtein) => {
      if (isFavorite(protein.id)) {
        await removeFromFavorites(protein.id);
      } else {
        await addToFavorites(protein);
      }
    },
    [isFavorite, removeFromFavorites, addToFavorites]
  );

  const value = React.useMemo<FavoritesContextType>(
    () => ({
      favorites,
      isFavorite,
      addToFavorites,
      removeFromFavorites,
      toggleFavorite,
    }),
    [favorites, isFavorite, addToFavorites, removeFromFavorites, toggleFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
