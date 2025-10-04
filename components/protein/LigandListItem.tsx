import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Card } from "../ui";
import { theme } from "../../styles/theme";

interface LigandListItemProps {
  readonly ligandId: string;
  readonly onPress: (ligandId: string) => void;
}

export default function LigandListItem({
  ligandId,
  onPress,
}: Readonly<LigandListItemProps>) {
  return (
    <TouchableOpacity
      onPress={() => onPress(ligandId)}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Card style={styles.card}>
        <View style={styles.content}>
          <View style={styles.info}>
            <Text style={styles.ligandId}>{ligandId}</Text>
            <Text style={styles.subtitle}>Tap to view molecule</Text>
          </View>
          <MCIcons
            name="chevron-right"
            size={24}
            color={theme.colors.primary.light}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  card: {
    margin: 0,
    marginBottom: 0,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
  },
  info: {
    flex: 1,
  },
  ligandId: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
});
