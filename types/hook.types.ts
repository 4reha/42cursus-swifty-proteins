/**
 * Hook-related types
 * Naming convention: PascalCase with descriptive names
 */

/**
 * useFetch hook return type
 */
export type UseFetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};
