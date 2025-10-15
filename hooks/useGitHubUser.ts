import useFetch from './useFetch';
import { User } from '@/types/types';

/**
 * Hook to fetch GitHub user data using useFetch
 */
export default function useGitHubUser(token: string | null) {
	const { data, loading, error } = useFetch<any>(
		token ? 'https://api.github.com/user' : '',
		{ responseType: 'json' }
	);

	const user: User | null = data ? {
		id: `gh_${data.id}`,
		email: data.email || `${data.login}@github.com`,
		username: data.login,
		authMethod: 'github',
		githubToken: token || undefined,
		avatarUrl: data.avatar_url,
		githubData: data,
	} : null;

	return {
		data: user,
		loading,
		error,
	};
}
