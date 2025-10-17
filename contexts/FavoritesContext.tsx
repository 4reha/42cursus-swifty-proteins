import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FavoriteProtein } from "@/types/ligand.types";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

export type FavoritesContextType = {
  favorites: FavoriteProtein[];
  isFavorite: (proteinId: string) => boolean;
  addToFavorites: (protein: FavoriteProtein) => Promise<void>;
  removeFromFavorites: (proteinId: string) => Promise<void>;
  toggleFavorite: (protein: FavoriteProtein) => Promise<void>;
  canAddFavorite: () => boolean;
  getFavoritesCount: () => number;
  getMaxFavorites: () => number;
};

export type FavoritesProviderProps = {
  children: React.ReactNode;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

const FAVORITES_STORAGE_KEY_PREFIX = "favorite_proteins_";
const MAX_FAVORITES = 10;

/**
 * Sanitize user identifier for use as a storage key
 * SecureStore only allows alphanumeric, ".", "-", and "_"
 */
const sanitizeUserKey = (userKey: string): string => {
  return userKey.replaceAll(/[^a-zA-Z0-9._-]/g, "_");
};

/**
 * Get storage key for a specific user's favorites
 */
const getUserFavoritesKey = (userId: string): string => {
  const sanitizedId = sanitizeUserKey(userId);
  return `${FAVORITES_STORAGE_KEY_PREFIX}${sanitizedId}`;
};

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  const [favorites, setFavorites] = useState<FavoriteProtein[]>([]);
  const { showToast } = useToast();
  const { user } = useAuth();

  // Get current storage key based on logged-in user
  const getStorageKey = useCallback((): string | null => {
    if (!user) return null;
    return getUserFavoritesKey(user.id);
  }, [user]);

  const loadFavorites = useCallback(async () => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      // No user logged in, clear favorites
      setFavorites([]);
      return;
    }

    try {
      const storedFavoriteIds = await SecureStore.getItemAsync(storageKey);
      if (storedFavoriteIds) {
        const favoriteIds = JSON.parse(storedFavoriteIds);

        // Remove duplicates and filter out invalid IDs
        const uniqueIds: string[] = Array.from(
          new Set(
            favoriteIds.filter(
              (id: any) => typeof id === "string" && id.trim() !== ""
            )
          )
        );

        // Create minimal favorites first
        const minimalFavorites: FavoriteProtein[] = uniqueIds.map(
          (id: string) => ({
            id,
            name: id,
            type: "Protein",
            lastViewed: new Date().toLocaleString(),
            atomCount: 0,
            bondCount: 0,
          })
        );

        setFavorites(minimalFavorites);
      } else {
        setFavorites([]);
      }
    } catch {
      showToast("Failed to load favorites", 3000);
      setFavorites([]);
    }
  }, [getStorageKey, showToast]);

  // Load favorites when user changes or on mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const saveFavorites = async (newFavorites: FavoriteProtein[]) => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      // No user logged in, can't save
      return;
    }

    try {
      // Store only IDs
      const favoriteIds = newFavorites.map((f: FavoriteProtein) => f.id);
      await SecureStore.setItemAsync(storageKey, JSON.stringify(favoriteIds));
    } catch {
      showToast("Failed to save favorites", 3000);
    }
  };

  const isFavorite = (proteinId: string): boolean => {
    return favorites.some((fav) => fav.id === proteinId);
  };

  const addToFavorites = async (protein: FavoriteProtein) => {
    // Quick validation checks
    if (favorites.length >= MAX_FAVORITES) {
      showToast(
        `You can only have ${MAX_FAVORITES} favorites. Remove one to add another.`,
        4000
      );
      return;
    }

    if (isFavorite(protein.id)) {
      showToast("This molecule is already in your favorites", 2000);
      return;
    }

    // Optimize: Update state immediately for instant UI feedback
    const newFavorites = [...favorites, protein];
    setFavorites(newFavorites);

    // Save to storage in background
    saveFavorites(newFavorites);
    showToast("Added to favorites", 2000);
  };

  const removeFromFavorites = async (proteinId: string) => {
    // Optimize: Update state immediately for instant UI feedback
    const newFavorites = favorites.filter((fav) => fav.id !== proteinId);
    setFavorites(newFavorites);

    // Save to storage in background
    saveFavorites(newFavorites);
    showToast("Removed from favorites", 2000);
  };

  const toggleFavorite = async (protein: FavoriteProtein) => {
    if (isFavorite(protein.id)) {
      await removeFromFavorites(protein.id);
    } else {
      await addToFavorites(protein);
    }
  };

  const canAddFavorite = (): boolean => {
    return favorites.length < MAX_FAVORITES;
  };

  const getFavoritesCount = (): number => {
    return favorites.length;
  };

  const getMaxFavorites = (): number => {
    return MAX_FAVORITES;
  };

  const value: FavoritesContextType = useMemo(
    () => ({
      favorites,
      isFavorite,
      addToFavorites,
      removeFromFavorites,
      toggleFavorite,
      canAddFavorite,
      getFavoritesCount,
      getMaxFavorites,
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
