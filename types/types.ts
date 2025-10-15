import { ReactNode, PropsWithChildren, ReactElement } from 'react';
import { StyleProp, ViewProps, ViewStyle, TextStyle, TouchableOpacityProps } from 'react-native';
// import { ParsedLigandData } from '../services/ligandAPI';
import MCIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Services types
export type ShareOptions = {
	ligandId: string;
	data: ParsedLigandData | null;
	svgUrl?: string;
	svgXml?: string | null;
	baseUrl?: string;
};

export type BiometricCapabilities = {
	isSupported: boolean;
	isEnrolled: boolean;
	biometricType: string;
};

export type GitHubTokenResponse = {
	access_token: string;
	token_type: string;
	scope: string;
};

export type GitHubUser = {
	id: number;
	login: string;
	name: string;
	email: string;
	avatar_url: string;
};

// Context types
export type ToastContextType = {
	showToast: (message: string, duration?: number) => void;
	hideToast: () => void;
};

export type ToastProviderProps = {
	children: ReactNode;
};

export type FavoriteProtein = {
	id: string;
	name: string;
	type?: string;
	lastViewed: string;
	atomCount?: number;
	bondCount?: number;
};

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
	children: ReactNode;
};

export type AuthMethod = 'password' | 'github';

export type User = {
	id: string;
	email: string;
	username: string;
	authMethod: AuthMethod;
	githubToken?: string;
	hashedPassword?: string;
	avatarUrl?: string;
	// Additional GitHub data
	githubData?: {
		name?: string;
		bio?: string;
		location?: string;
		company?: string;
		blog?: string;
		twitter_username?: string;
		public_repos?: number;
		public_gists?: number;
		followers?: number;
		following?: number;
		created_at?: string;
		updated_at?: string;
		hireable?: boolean;
		html_url?: string;
		repos_url?: string;
		organizations_url?: string;
		starred_url?: string;
		subscriptions_url?: string;
		received_events_url?: string;
		events_url?: string;
		type?: string;
		site_admin?: boolean;
		gravatar_id?: string;
		node_id?: string;
		url?: string;
		followers_url?: string;
		following_url?: string;
		gists_url?: string;
		plan?: {
			name: string;
			space: number;
			private_repos: number;
			collaborators: number;
		};
		// Additional fetched data
		recent_repos?: any[];
		organizations?: any[];
		starred_repos?: any[];
	};
};

export type AuthContextType = {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	isBiometricSupported: boolean;
	isBiometricEnrolled: boolean;
	isBiometricEnabled: boolean;
	currentAuthMethod: AuthMethod | null;

	// Auth methods
	loginWithPassword: (email: string, password: string) => Promise<void>;
	loginWithGitHub: () => Promise<void>;
	loginWithBiometric: () => Promise<boolean>;
	logout: () => Promise<void>;

	// Biometric settings
	enableBiometric: () => Promise<boolean>;
	disableBiometric: () => Promise<void>;

	// Check if accounts exist
	hasPasswordAccount: () => Promise<boolean>;
	hasGitHubAccount: () => Promise<boolean>;

	// Sharing state management
	setSharingInProgress: (inProgress: boolean) => void;

	// Utility functions
	clearPasswordAccount: () => Promise<void>;
};

// Component types
export type CardProps = ViewProps & {
	readonly children: ReactNode;
	readonly style?: StyleProp<ViewStyle>;
};

export type ButtonVariant = "primary" | "success" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<TouchableOpacityProps, "style"> & {
	readonly title: string;
	readonly variant?: ButtonVariant;
	readonly size?: ButtonSize;
	readonly loading?: boolean;
	readonly disabled?: boolean;
	readonly icon?: keyof typeof MCIcons.glyphMap;
	readonly iconPosition?: "left" | "right";
	readonly style?: StyleProp<ViewStyle>;
	readonly textStyle?: StyleProp<TextStyle>;
};

export type CollapsibleCardProps = {
	title: string;
	children: React.ReactNode;
	defaultExpanded?: boolean;
}

export type Molecule3DViewerProps = {
	data: ParsedLigandData | null;
	style?: any;
};

export type MoleculeInfoProps = {
	readonly data?: ParsedLigandData | null;
	readonly svgXml?: string | null;
	readonly svgLoading?: boolean;
	readonly svgError?: string | null;
}

export type Atom = {
	atomId: string;
	element?: string;
	type?: string;
	x?: number;
	y?: number;
	z?: number;
	idealX?: number;
	idealY?: number;
	idealZ?: number;
	aromatic?: boolean;
	leaving?: boolean;
	stereo?: string | null;
	backbone?: boolean;
	nTerminal?: boolean;
	cTerminal?: boolean;
};

export type Bond = {
	a: string;
	b: string;
	order: string;
};

export type ParsedLigandData = {
	id: string;
	name?: string;
	type?: string;
	pdbxType?: string;
	formula?: string;
	weight?: number;
	oneLetterCode?: string;
	releaseStatus?: string;
	threeLetterCode?: string;
	synonyms?: string[] | string;
	formalCharge?: string | number;
	initialDate?: string;
	modifiedDate?: string;
	descriptors?: { smiles?: string; inchi?: string; inchiKey?: string };
	identifiers?: { systematicName?: string[] };
	atoms: Atom[];
	bonds: Bond[];
	svgUrl?: string;
	cifUrl?: string;
	pdbxModelDbCode?: string;
	processingSite?: string;
	ambiguousFlag?: string;
	pcm?: string;
	audit?: { action?: string; date?: string; site?: string }[];
};

export type UseFetchResult<T> = {
	data: T | null;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
};

export type Props = PropsWithChildren<{
	headerImage: ReactElement;
	headerBackgroundColor: { dark: string; light: string };
}>;