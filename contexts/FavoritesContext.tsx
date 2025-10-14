import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface FavoriteProtein {
	id: string;
	name: string;
	type?: string;
	lastViewed: string;
	atomCount?: number;
	bondCount?: number;
}

interface FavoritesContextType {
	favorites: FavoriteProtein[];
	isFavorite: (proteinId: string) => boolean;
	addToFavorites: (protein: FavoriteProtein) => Promise<void>;
	removeFromFavorites: (proteinId: string) => Promise<void>;
	toggleFavorite: (protein: FavoriteProtein) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'favorite_proteins';

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
			const storedFavorites = await SecureStore.getItemAsync(FAVORITES_STORAGE_KEY);
			if (storedFavorites) {
				const parsedFavorites = JSON.parse(storedFavorites);
				setFavorites(parsedFavorites);
			}
		} catch (error) {
			console.error('Error loading favorites:', error);
		}
	};

	const saveFavorites = async (newFavorites: FavoriteProtein[]) => {
		try {
			await SecureStore.setItemAsync(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
			setFavorites(newFavorites);
		} catch (error) {
			console.error('Error saving favorites:', error);
		}
	};

	const isFavorite = (proteinId: string): boolean => {
		return favorites.some(fav => fav.id === proteinId);
	};

	const addToFavorites = async (protein: FavoriteProtein) => {
		const newFavorites = [...favorites, protein];
		await saveFavorites(newFavorites);
	};

	const removeFromFavorites = async (proteinId: string) => {
		const newFavorites = favorites.filter(fav => fav.id !== proteinId);
		await saveFavorites(newFavorites);
	};

	const toggleFavorite = async (protein: FavoriteProtein) => {
		if (isFavorite(protein.id)) {
			await removeFromFavorites(protein.id);
		} else {
			await addToFavorites(protein);
		}
	};

	const value: FavoritesContextType = {
		favorites,
		isFavorite,
		addToFavorites,
		removeFromFavorites,
		toggleFavorite,
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
