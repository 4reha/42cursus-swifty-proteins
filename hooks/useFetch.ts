import axios, { AxiosResponse, isCancel } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { UseFetchResult } from '@/types/types';

/**
 * Simple useFetch hook for GET requests only
 * - auto-cancels on unmount
 * - only refetches when URL changes
 * - returns { data, loading, error, refetch }
 */
export default function useFetch<T = any>(url: string, options?: { responseType?: 'text' | 'json' }): UseFetchResult<T> {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const controllerRef = useRef<AbortController | null>(null);

	const fetchData = useCallback(async () => {
		if (!url) {
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		// Cancel previous request
		controllerRef.current?.abort();
		controllerRef.current = new AbortController();

		try {
			const response: AxiosResponse<T> = await axios.get(url, {
				signal: controllerRef.current.signal,
				responseType: options?.responseType || 'json',
			});
			setData(response.data);
		} catch (err: any) {
			if (isCancel(err)) {
				// Request was cancelled, ignore
				return;
			}
			setError(err?.message || String(err));
		} finally {
			setLoading(false);
		}
	}, [url, options?.responseType]);

	// Fetch when URL changes
	useEffect(() => {
		fetchData();
		return () => {
			controllerRef.current?.abort();
		};
	}, [fetchData]);

	return {
		data,
		loading,
		error,
		refetch: fetchData,
	};
}