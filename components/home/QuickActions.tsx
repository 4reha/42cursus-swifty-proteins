/**
 * QuickActions Component
 * Displays quick action buttons for navigation
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { NavigationService } from "@/services/navigationService";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export function QuickActions() {
  return (
    <ThemedView style={styles.quickActionsContainer}>
      <ThemedText type="subtitle">Quick Actions</ThemedText>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => NavigationService.toExplore()}
        >
          <Ionicons name="search-outline" size={20} color="#fff" />
          <ThemedText style={styles.quickActionText}>
            Search Proteins
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => NavigationService.toFavorites()}
        >
          <Ionicons name="bookmark-outline" size={20} color="#fff" />
          <ThemedText style={styles.quickActionText}>Favorites</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  quickActionsContainer: {
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  quickActionItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "rgba(74, 144, 226, 0.2)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.3)",
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
