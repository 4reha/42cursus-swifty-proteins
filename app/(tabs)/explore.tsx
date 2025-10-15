import { LIGANDS } from '@/config/ligands';
import { globalStyles } from '@/styles/globalStyles';
import { theme } from '@/styles/theme';
import MCIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

export default function ProteinsScreen() {
	const [searchQuery, setSearchQuery] = useState('');
	const [isSearchFocused, setIsSearchFocused] = useState(false);

	const filteredLigands = useMemo(() => {
		if (!searchQuery.trim()) return LIGANDS;
		return LIGANDS.filter(ligand =>
			ligand.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [searchQuery]);

	const clearSearch = () => {
		setSearchQuery('');
	};

	function AnimatedLigandItem({ item, index }: { item: string; index: number }) {
		const router = useRouter();

		const navigateToDetail = (target: string) => {
			try {
				router.push({
					pathname: '/explore/[id]',
					params: { id: target },
				});
			} catch (err) {
				console.warn('Navigation to explore detail failed:', err);
			}
		};

		return (
			<Animated.View
				entering={FadeInUp.delay(index * 50)}
				layout={Layout.springify()}
			>
				<TouchableOpacity
					style={{
						backgroundColor: theme.colors.background.card,
						padding: theme.spacing.lg,
						marginBottom: theme.spacing.sm,
						borderRadius: theme.borderRadius.lg,
						borderWidth: 1,
						borderColor: theme.colors.border.medium,
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
					onPress={() => navigateToDetail(item)}
					activeOpacity={0.7}
				>
					<View style={{ flex: 1 }}>
						<Text style={{
							color: theme.colors.text.white,
							fontSize: theme.typography.fontSize.base,
							fontWeight: theme.typography.fontWeight.medium,
						}}>{item}</Text>
						<Text style={{
							color: theme.colors.text.whiteLight,
							fontSize: theme.typography.fontSize.xs,
							marginTop: theme.spacing.xs,
							opacity: 0.8,
						}}>{'Protein Data Bank ligand'}</Text>
					</View>
					<MCIcons name="chevron-right" size={20} color={theme.colors.text.whiteLight} />
				</TouchableOpacity>
			</Animated.View>
		);
	}

	return (
		<View style={globalStyles.container}>
			{/* Search Input */}
			<View style={{
				paddingHorizontal: theme.spacing.xl,
			}}>
				<View style={[
					globalStyles.inputContainer,
					{
						flexDirection: 'row',
						alignItems: 'center',
						backgroundColor: isSearchFocused
							? theme.colors.background.overlayStrong
							: theme.colors.background.card,
					}
				]}>
					<MCIcons
						name="magnify"
						size={20}
						color={theme.colors.text.whiteLight}
						style={{ marginRight: theme.spacing.sm }}
					/>
					<TextInput
						placeholder={"Search local ligands..."}
						placeholderTextColor={theme.colors.text.whiteLight}
						style={[globalStyles.input, { flex: 1 }]}
						value={searchQuery}
						onChangeText={setSearchQuery}
						onFocus={() => setIsSearchFocused(true)}
						onBlur={() => setIsSearchFocused(false)}
					/>
					{searchQuery.length > 0 && (
						<TouchableOpacity onPress={clearSearch} style={{ marginLeft: theme.spacing.sm }}>
							<MCIcons
								name="close-circle"
								size={20}
								color={theme.colors.text.whiteLight}
							/>
						</TouchableOpacity>
					)}
				</View>
			</View>

			{/* Stats Container */}
			<View style={styles.statsContainer}>
				<View style={styles.statsContent}>
					<Text style={styles.statsText}>Ligands</Text>
					<Text style={styles.searchResultsText}>
						{searchQuery
							? `${filteredLigands.length} results for "${searchQuery}"`
							: `${LIGANDS.length} ligands available`}
					</Text>
				</View>
			</View>

			{/* Ligands List */}
			<FlatList
				data={filteredLigands}
				renderItem={({ item, index }) => <AnimatedLigandItem item={item} index={index} />}
				keyExtractor={(item) => item}
				contentContainerStyle={{
					paddingHorizontal: theme.spacing.xl,
					paddingBottom: theme.spacing.xl,
				}}
				showsVerticalScrollIndicator={false}
				removeClippedSubviews
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	statsContainer: {
		paddingHorizontal: theme.spacing.xl,
		backgroundColor: 'transparent',
	},
	statsContent: {
		flexDirection: 'row' as const,
		justifyContent: 'space-between' as const,
		alignItems: 'center' as const,
		paddingVertical: theme.spacing.sm,
	},
	statsText: {
		color: theme.colors.text.white,
		fontSize: theme.typography.fontSize.sm,
		fontWeight: theme.typography.fontWeight.medium,
		opacity: 0.8,
	},
	searchResultsText: {
		color: theme.colors.text.whiteLight,
		fontSize: theme.typography.fontSize.xs,
		opacity: 0.6,
	},
});