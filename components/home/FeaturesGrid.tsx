/**
 * FeaturesGrid Component
 * Displays the key features of the application
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

export function FeaturesGrid() {
  return (
    <ThemedView style={styles.featuresContainer}>
      <ThemedText type="subtitle">Key Features</ThemedText>
      <View style={styles.featuresGrid}>
        <View style={styles.featureItem}>
          <Ionicons name="eye-outline" size={24} color="#4A90E2" />
          <ThemedText style={styles.featureTitle}>3D Visualization</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Interactive 3D protein structure viewing
          </ThemedText>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="analytics-outline" size={24} color="#4A90E2" />
          <ThemedText style={styles.featureTitle}>Analysis Tools</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Advanced protein analysis and comparison
          </ThemedText>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="cloud-outline" size={24} color="#4A90E2" />
          <ThemedText style={styles.featureTitle}>Cloud Sync</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Sync your work across devices
          </ThemedText>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="people-outline" size={24} color="#4A90E2" />
          <ThemedText style={styles.featureTitle}>Collaboration</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Share and collaborate on projects
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  featuresContainer: {
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  featureItem: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    gap: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
