/**
 * AppInfoCard Component
 * Displays application information
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

export function AppInfoCard() {
  return (
    <ThemedView style={styles.appInfoContainer}>
      <View style={styles.appHeader}>
        <Ionicons name="flask" size={32} color="#4A90E2" />
        <View style={styles.appTitleContainer}>
          <ThemedText type="subtitle" style={styles.appTitle}>
            Swifty Protein
          </ThemedText>
          <ThemedText style={styles.appSubtitle}>42 School Project</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.appDescription}>
        A powerful protein visualization and analysis tool for researchers and
        students.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  appInfoContainer: {
    gap: 12,
    marginBottom: 24,
    padding: 16,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.2)",
  },
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appTitleContainer: {
    flex: 1,
  },
  appTitle: {
    color: "#4A90E2",
    fontSize: 20,
    fontWeight: "600",
  },
  appSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    color: "#4A90E2",
  },
  appDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
});
