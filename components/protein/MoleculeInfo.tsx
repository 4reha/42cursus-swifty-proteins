import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ParsedLigandData } from "../../services/ligandAPI";
import { Card } from "../ui";
import { theme } from "../../styles/theme";

interface MoleculeInfoProps {
  readonly data: ParsedLigandData;
}

export default function MoleculeInfo({ data }: Readonly<MoleculeInfoProps>) {
  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Molecular Information</Text>

      <InfoRow label="Name" value={data.name || data.id} />

      {data.synonyms && data.synonyms != "?" && (
        <InfoRow label="Synonyms" value={data.synonyms.toString()} />
      )}

      {data.formula && <InfoRow label="Formula" value={data.formula} />}

      {data.weight && <InfoRow label="Weight" value={`${data.weight} g/mol`} />}

      <InfoRow label="Atoms" value={data.atoms.length.toString()} />
      <InfoRow label="Bonds" value={data.bonds.length.toString()} />
    </Card>
  );
}

interface InfoRowProps {
  readonly label: string;
  readonly value: string;
}

function InfoRow({ label, value }: Readonly<InfoRowProps>) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue} numberOfLines={0}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
    minWidth: 80,
    marginRight: theme.spacing.md,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    flex: 1,
    textAlign: "right",
  },
});
