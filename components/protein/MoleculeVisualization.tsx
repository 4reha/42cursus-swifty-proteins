import React from "react";
import { Text, StyleSheet } from "react-native";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ParsedLigandData } from "../../services/ligandAPI";
import { Card } from "../ui";
import { theme } from "../../styles/theme";

interface MoleculeVisualizationProps {
  readonly data: ParsedLigandData;
}

export default function MoleculeVisualization({
  data,
}: Readonly<MoleculeVisualizationProps>) {
  return (
    <Card style={styles.container}>
      <MCIcons name="cube-outline" size={120} color={theme.colors.text.muted} />
      <Text style={styles.title}>3D Visualization</Text>
      <Text style={styles.subtitle}>
        3D molecular viewer will be implemented here.{"\n"}
        Currently showing parsed data from CIF file.
      </Text>
      <Text style={styles.details}>
        Loaded {data.atoms.length} atoms and {data.bonds.length} bonds
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: theme.spacing["4xl"],
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.muted,
    textAlign: "center",
    lineHeight: theme.typography.lineHeight.normal,
    marginBottom: theme.spacing.lg,
  },
  details: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.light,
    textAlign: "center",
    fontWeight: theme.typography.fontWeight.medium,
  },
});
