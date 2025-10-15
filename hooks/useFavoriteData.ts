import useFetch from './useFetch';
import { FavoriteProtein } from '@/types/types';

/**
 * Hook to fetch full data for a favorite protein using useFetch
 */
export default function useFavoriteData(id: string) {
	const { data, loading, error } = useFetch<any>(
		`https://www.rcsb.org/rest/v1/core/chemcomp/${id}`,
		{ responseType: 'json' }
	);

	const favoriteData: FavoriteProtein | null = data ? {
		id,
		name: data.chem_comp?.name || id,
		type: 'Protein',
		lastViewed: new Date().toLocaleString(),
		atomCount: 0, // Will be updated when molecule is loaded
		bondCount: 0, // Will be updated when molecule is loaded
	} : null;

	return {
		data: favoriteData,
		loading,
		error,
	};
}

