/**
 * FeaturesGrid Component
 * Displays the key features of the application
 */

import { theme } from "@/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export function FeaturesGrid() {
  return (
    <View style={styles.featuresContainer}>
      <Text style={styles.featuresTitle}>Key Features</Text>
      <View style={styles.featuresGrid}>
        <View style={styles.featureItem}>
          <Ionicons name="eye-outline" size={24} color="#4A90E2" />
          <Text style={styles.featureTitle}>3D Visualization</Text>
          <Text style={styles.featureDescription}>
            Interactive 3D protein structure viewing
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="analytics-outline" size={24} color="#4A90E2" />
          <Text style={styles.featureTitle}>Analysis Tools</Text>
          <Text style={styles.featureDescription}>
            Advanced protein analysis and comparison
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="cloud-outline" size={24} color="#4A90E2" />
          <Text style={styles.featureTitle}>Cloud Sync</Text>
          <Text style={styles.featureDescription}>
            Sync your work across devices
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="people-outline" size={24} color="#4A90E2" />
          <Text style={styles.featureTitle}>Collaboration</Text>
          <Text style={styles.featureDescription}>
            Share and collaborate on projects
          </Text>
        </View>
      </View>
    </View>
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
  featuresTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text.white,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: theme.colors.text.white,
  },
  featureDescription: {
    fontSize: 12,
    color: theme.colors.text.light,
    textAlign: "center",
  },
});
