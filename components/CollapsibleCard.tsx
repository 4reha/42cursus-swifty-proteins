import { theme } from '@/styles/theme';
import MCIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Card from './ui/Card';

type CollapsibleCardProps = {
	title: string;
	children: React.ReactNode;
	defaultExpanded?: boolean;
}

export default function CollapsibleCard({ title, children, defaultExpanded = false }: CollapsibleCardProps) {
	const [expanded, setExpanded] = useState(defaultExpanded);

	return (
		<Card style={{ marginBottom: theme.spacing.md }}>
			<TouchableOpacity
				style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: theme.spacing.md }}
				onPress={() => setExpanded(!expanded)}
				activeOpacity={0.7}
			>
				<Text style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text.white, flex: 1, marginRight: theme.spacing.sm, flexShrink: 1 }} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
				<MCIcons
					name={expanded ? 'chevron-up' : 'chevron-down'}
					size={20}
					color={theme.colors.text.whiteLight}
				/>
			</TouchableOpacity>
			{expanded && (
				<View style={{ paddingTop: theme.spacing.sm }}>
					{children}
				</View>
			)}
		</Card>
	);
}
