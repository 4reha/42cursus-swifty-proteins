import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { FavoriteProtein, FavoritesContextType, FavoritesProviderProps } from '@/types/types';
import { useToast } from './ToastContext';

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'favorite_proteins';
const MAX_FAVORITES = 10;

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
	const [favorites, setFavorites] = useState<FavoriteProtein[]>([]);
	const { showToast } = useToast();

	const loadFavorites = useCallback(async () => {
		try {
			const storedFavoriteIds = await SecureStore.getItemAsync(FAVORITES_STORAGE_KEY);
			if (storedFavoriteIds) {
				const favoriteIds = JSON.parse(storedFavoriteIds);

				// Create minimal favorites first
				const minimalFavorites = favoriteIds.map((id: string) => ({
					id,
					name: id,
					type: 'Protein',
					lastViewed: new Date().toLocaleString(),
					atomCount: 0,
					bondCount: 0,
				}));

				setFavorites(minimalFavorites);
			}
		} catch {
			showToast('Failed to load favorites', 3000);
		}
	}, [showToast]);

	// Load favorites from storage on mount
	useEffect(() => {
		loadFavorites();
	}, [loadFavorites]);

	const saveFavorites = async (newFavorites: FavoriteProtein[]) => {
		try {
			// Store only IDs
			const favoriteIds = newFavorites.map((f: FavoriteProtein) => f.id);
			await SecureStore.setItemAsync(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
		} catch {
			showToast('Failed to save favorites', 3000);
		}
	};

	const isFavorite = (proteinId: string): boolean => {
		return favorites.some(fav => fav.id === proteinId);
	};

	const addToFavorites = async (protein: FavoriteProtein) => {
		// Quick validation checks
		if (favorites.length >= MAX_FAVORITES) {
			showToast(`You can only have ${MAX_FAVORITES} favorites. Remove one to add another.`, 4000);
			return;
		}

		if (isFavorite(protein.id)) {
			showToast('This molecule is already in your favorites', 2000);
			return;
		}

		// Optimize: Update state immediately for instant UI feedback
		const newFavorites = [...favorites, protein];
		setFavorites(newFavorites);

		// Save to storage in background
		saveFavorites(newFavorites);
		showToast('Added to favorites', 2000);
	};

	const removeFromFavorites = async (proteinId: string) => {
		// Optimize: Update state immediately for instant UI feedback
		const newFavorites = favorites.filter(fav => fav.id !== proteinId);
		setFavorites(newFavorites);

		// Save to storage in background
		saveFavorites(newFavorites);
		showToast('Removed from favorites', 2000);
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

	const value: FavoritesContextType = {
		favorites,
		isFavorite,
		addToFavorites,
		removeFromFavorites,
		toggleFavorite,
		canAddFavorite,
		getFavoritesCount,
		getMaxFavorites,
	};

	return (
		<FavoritesContext.Provider value={value}>
			{children}
		</FavoritesContext.Provider>
	);
};

export const useFavorites = () => {
	const context = useContext(FavoritesContext);
	if (context === undefined) {
		throw new Error('useFavorites must be used within a FavoritesProvider');
	}
	return context;
};
