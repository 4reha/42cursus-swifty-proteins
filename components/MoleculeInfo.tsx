import { ParsedLigandData } from "@/types/ligand.types";
import { theme } from "@/styles/theme";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import Card from "./ui/Card";
import CollapsibleCard from "./CollapsibleCard";

type MoleculeInfoProps = {
  readonly data?: ParsedLigandData | null;
  readonly svgXml?: string | null;
  readonly svgLoading?: boolean;
  readonly svgError?: string | null;
};

export default function MoleculeInfo({
  data,
  svgXml,
  svgLoading,
  svgError,
}: Readonly<MoleculeInfoProps>) {
  // Defensive rendering: if data is not yet available, show a small placeholder
  if (!data) {
    return (
      <Card style={styles.container}>
        <Text style={styles.title}>Molecular Information</Text>
        <Text style={{ color: theme.colors.text.whiteLight }}>
          No molecule data available.
        </Text>
      </Card>
    );
  }

  return (
    <>
      {/* Visual 2D preview at top */}
      <Card style={styles.visualCard}>
        <View style={styles.svgPreviewCard}>
          {svgLoading ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator size="small" color="#00d4ff" />
              <Text style={{ color: theme.colors.text.white, marginTop: 8 }}>
                Loading 2D structure…
              </Text>
            </View>
          ) : svgError ? (
            <Text style={{ color: "#ff6b6b", textAlign: "center" }}>
              {svgError}
            </Text>
          ) : svgXml ? (
            <View style={styles.svgPreview}>
              <Text style={styles.visualSubtitle}>
                Linear molecular structure
              </Text>
              <Text style={styles.formula}>{data?.formula}</Text>
              <SvgXml xml={svgXml} width="100%" height={240} />
            </View>
          ) : (
            <Text style={{ color: theme.colors.text.whiteLight }}>
              No 2D structure available.
            </Text>
          )}
        </View>
      </Card>

      {/* Basic Information */}
      <CollapsibleCard title="🧪 Basic Information" defaultExpanded>
        <InfoGrid>
          <InfoItem label="Compound ID" value={data.id} />
          <InfoItem label="Chemical Name" value={data.name || "N/A"} />
          <InfoItem label="Type" value={data.type || "N/A"} badge={data.type} />
          <InfoItem
            label="Molecular Weight"
            value={data.weight ? `${data.weight} g/mol` : "N/A"}
          />
          <InfoItem
            label="Formal Charge"
            value={
              data.formalCharge !== undefined && data.formalCharge !== null
                ? String(data.formalCharge)
                : "N/A"
            }
            badge={data.formalCharge === 0 ? "Neutral" : undefined}
          />
          <InfoItem label="Chemical Formula" value={data.formula || "N/A"} />
          <InfoItem
            label="Three-letter Code"
            value={data.threeLetterCode || "N/A"}
          />
        </InfoGrid>
      </CollapsibleCard>

      {/* Atomic Structure */}
      <CollapsibleCard title="⚛️ Atomic Structure">
        <Text style={styles.subtitle}>
          The molecule contains {data.atoms?.length ?? 0} atoms
        </Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1 }]}>Atom</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Element</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>
              Ideal Position (Å)
            </Text>
          </View>
          {data.atoms &&
            data.atoms.map((a, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text
                  style={[styles.tableCell, { flex: 1, fontWeight: "600" }]}
                >
                  {a.atomId || ""}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {a.element || ""}
                </Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {a.idealX !== undefined &&
                    a.idealY !== undefined &&
                    a.idealZ !== undefined
                    ? `(${a.idealX.toFixed(3)}, ${a.idealY.toFixed(
                      3
                    )}, ${a.idealZ.toFixed(3)})`
                    : "-"}
                </Text>
              </View>
            ))}
        </View>
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            <Text style={{ fontWeight: "600" }}>Properties: </Text>
            All atoms are non-aromatic, no stereochemistry configuration
          </Text>
        </View>
      </CollapsibleCard>

      {/* Bond Structure */}
      <CollapsibleCard title="🔗 Bond Structure">
        {(() => {
          const humanizeOrder = (o?: string | number) => {
            if (o === undefined || o === null) return "Unknown";
            const s = String(o).toUpperCase();
            if (s.includes("DOUB") || s === "2" || s.startsWith("D"))
              return "Double Bond";
            if (s.includes("SING") || s === "1" || s.startsWith("S"))
              return "Single Bond";
            if (s.includes("TRIP") || s === "3" || s.startsWith("T"))
              return "Triple Bond";
            return s;
          };

          return (
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { flex: 1 }]}>Bond</Text>
                <Text style={[styles.headerCell, { flex: 2 }]}>Type</Text>
                <Text style={[styles.headerCell, { flex: 1 }]}>Atoms</Text>
              </View>
              {data.bonds &&
                data.bonds.map((bond, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text
                      style={[styles.tableCell, { flex: 1, fontWeight: "600" }]}
                    >
                      Bond {i + 1}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      <Badge text={humanizeOrder(bond.order)} />
                    </Text>
                    <Text
                      style={[styles.tableCell, { flex: 1 }]}
                    >{`${bond.a}=${bond.b}`}</Text>
                  </View>
                ))}
            </View>
          );
        })()}
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            Linear O=C=O structure with {data.bonds?.length || 0} bond
            {(data.bonds?.length || 0) === 1 ? "" : "s"}
          </Text>
        </View>
      </CollapsibleCard>

      {/* Molecular Geometry */}
      <CollapsibleCard title="📐 Molecular Geometry">
        {(() => {
          const calculateBondLength = () => {
            if (!data.atoms || data.atoms.length < 2) return null;
            const atom1 = data.atoms.find(
              (a) => a.element?.toUpperCase() === "C"
            );
            const atom2 = data.atoms.find(
              (a) => a.element?.toUpperCase() === "O"
            );
            if (
              atom1 &&
              atom2 &&
              atom1.idealX !== undefined &&
              atom2.idealX !== undefined
            ) {
              const dx = atom2.idealX - atom1.idealX;
              const dy = (atom2.idealY || 0) - (atom1.idealY || 0);
              const dz = (atom2.idealZ || 0) - (atom1.idealZ || 0);
              return Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(3);
            }
            return null;
          };

          const bondLength = calculateBondLength();
          const carbonAtom = data.atoms?.find(
            (a) => a.element?.toUpperCase() === "C"
          );

          return (
            <View style={styles.geometryBox}>
              {bondLength && (
                <GeometryRow
                  label="C=O Bond Length"
                  value={`${bondLength} Å`}
                />
              )}
              <GeometryRow label="O-C-O Angle" value="180° (Linear)" />
              {carbonAtom && (
                <>
                  <GeometryRow
                    label="Carbon Position"
                    value={`(${(carbonAtom.idealX || 0).toFixed(3)}, ${(
                      carbonAtom.idealY || 0
                    ).toFixed(3)}, ${(carbonAtom.idealZ || 0).toFixed(3)})`}
                  />
                </>
              )}
            </View>
          );
        })()}
      </CollapsibleCard>

      {/* Chemical Identifiers */}
      <CollapsibleCard title="🔬 Chemical Identifiers">
        <InfoGrid>
          <InfoItem
            label="SMILES"
            value={data.descriptors?.smiles || "N/A"}
            mono
          />
          <InfoItem
            label="InChI"
            value={data.descriptors?.inchi || "N/A"}
            mono
            small
          />
          <InfoItem
            label="InChIKey"
            value={data.descriptors?.inchiKey || "N/A"}
            mono
            small
          />
          {data.identifiers?.systematicName && (
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>ALTERNATIVE NAMES</Text>
              {Array.isArray(data.identifiers.systematicName) ? (
                data.identifiers.systematicName.map((name, idx) => (
                  <Text key={idx} style={styles.infoItemValue}>
                    {name}
                  </Text>
                ))
              ) : (
                <Text style={styles.infoItemValue}>
                  {data.identifiers.systematicName as unknown as string}
                </Text>
              )}
            </View>
          )}
        </InfoGrid>
      </CollapsibleCard>

      {/* Database Information */}
      <CollapsibleCard title="💾 Database Information">
        <InfoGrid>
          <InfoItem
            label="PDB Model Code"
            value={data.pdbxModelDbCode || "N/A"}
          />
          <InfoItem
            label="Release Status"
            value={data.releaseStatus || "N/A"}
            badge={data.releaseStatus}
          />
          <InfoItem
            label="Processing Site"
            value={data.processingSite || "N/A"}
          />
          <InfoItem label="Initial Entry" value={data.initialDate || "N/A"} />
          <InfoItem label="Last Modified" value={data.modifiedDate || "N/A"} />
        </InfoGrid>
      </CollapsibleCard>

      {/* Audit History */}
      {data.audit && data.audit.length > 0 && (
        <CollapsibleCard title="📅 Audit History">
          <View style={styles.timeline}>
            {data.audit.map((item, idx) => (
              <View key={idx} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                {idx < data.audit!.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>
                    {item.date || "Unknown date"}
                  </Text>
                  <Text style={styles.timelineText}>
                    {item.action || "Unknown action"}{" "}
                    {item.site ? `(${item.site})` : ""}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </CollapsibleCard>
      )}
    </>
  );
}

// Info Grid Component
function InfoGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.infoGrid}>{children}</View>;
}

// Info Item Component
type InfoItemProps = {
  label: string;
  value: string;
  badge?: string;
  mono?: boolean;
  small?: boolean;
};

function InfoItem({ label, value, badge, mono, small }: InfoItemProps) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoItemRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.infoItemLabel}>{label.toUpperCase()}</Text>
          <Text
            style={[
              styles.infoItemValue,
              mono && { fontFamily: "monospace" },
              small && { fontSize: theme.typography.fontSize.xs },
            ]}
          >
            {value}
          </Text>
        </View>
        {badge ? (
          <View style={styles.badgeWrapper}>
            <Badge text={badge} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

// Badge Component
function Badge({ text }: { text: string }) {
  const getBadgeColor = (text: string) => {
    const upper = text.toUpperCase();
    if (upper.includes("NEUTRAL") || upper === "0") return "#28a745";
    if (upper.includes("NON-POLYMER")) return "#ffc107";
    if (upper.includes("REL") || upper.includes("RELEASED")) return "#667eea";
    if (upper.includes("DOUBLE")) return "#667eea";
    if (upper.includes("SINGLE")) return "#17a2b8";
    if (upper.includes("TRIPLE")) return "#fd7e14";
    return "#667eea";
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBadgeColor(text) }]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

// Geometry Row Component
function GeometryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.geometryRow}>
      <Text style={styles.geometryLabel}>{label}</Text>
      <Text style={styles.geometryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.white,
    marginBottom: theme.spacing.sm,
  },
  container: {
    // marginBottom: theme.spacing.md,
  },
  visualCard: {
    // marginBottom: theme.spacing.md,
    alignItems: "center",
    // paddingVertical: theme.spacing.xl,
  },
  svgPreviewCard: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.colors.background.card,
    alignItems: "center",
    // padding: theme.spacing.md,
    // marginTop: theme.spacing.sm,
  },
  svgPreview: {
    width: "100%",
    borderRadius: 12,
    // overflow: 'hidden',
    backgroundColor: theme.colors.background.card,
    alignItems: "center",
    // padding: theme.spacing.md,
  },
  formula: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#667eea",
    paddingVertical: theme.spacing.sm,
  },
  visualSubtitle: {
    color: theme.colors.text.whiteLight,
    fontSize: theme.typography.fontSize.sm,
  },
  moleculeDiagram: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: theme.spacing.lg,
  },
  atom: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  oxygenAtom: {
    backgroundColor: "#ff6b6b",
  },
  carbonAtom: {
    backgroundColor: "#4a4a4a",
  },
  atomText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  bond: {
    width: 30,
    height: 12,
    justifyContent: "space-around",
    paddingVertical: 2,
  },
  bondLine: {
    height: 3,
    backgroundColor: "#333333",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.white,
    flex: 1,
    marginRight: theme.spacing.sm,
    flexShrink: 1,
  },
  cardContent: {
    paddingTop: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.text.whiteLight,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.md,
  },
  infoGrid: {
    gap: theme.spacing.md,
  },
  infoItem: {
    padding: theme.spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#667eea",
  },
  infoItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeWrapper: {
    marginLeft: theme.spacing.sm,
    alignSelf: "flex-start",
  },
  infoItemLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.whiteLight,
    marginBottom: theme.spacing.xs,
    letterSpacing: 0.5,
  },
  infoItemValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.white,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: theme.spacing.xs,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  tableContainer: {
    marginTop: theme.spacing.sm,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: theme.spacing.sm,
    backgroundColor: "#667eea",
    borderRadius: 8,
    paddingHorizontal: theme.spacing.sm,
  },
  headerCell: {
    color: "#ffffff",
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  tableCell: {
    color: theme.colors.text.white,
    fontSize: theme.typography.fontSize.xs,
  },
  noteBox: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    padding: theme.spacing.md,
    borderRadius: 8,
    marginTop: theme.spacing.md,
  },
  noteText: {
    color: theme.colors.text.whiteLight,
    fontSize: theme.typography.fontSize.sm,
  },
  geometryBox: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderRadius: 12,
    padding: theme.spacing.md,
  },
  geometryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    borderStyle: "dashed",
  },
  geometryLabel: {
    color: theme.colors.text.whiteLight,
    fontSize: theme.typography.fontSize.sm,
  },
  geometryValue: {
    color: theme.colors.text.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  timeline: {
    paddingLeft: theme.spacing.lg,
  },
  timelineItem: {
    position: "relative",
    paddingBottom: theme.spacing.lg,
  },
  timelineDot: {
    position: "absolute",
    left: -20,
    top: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#667eea",
  },
  timelineLine: {
    position: "absolute",
    left: -16,
    top: 16,
    width: 2,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontSize: theme.typography.fontSize.xs,
    color: "#667eea",
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  timelineText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.white,
  },
});
