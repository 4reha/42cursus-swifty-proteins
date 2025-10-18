/**
 * QuickActions Component
 * Displays quick action buttons for navigation
 */

import { theme } from "@/styles/theme";
import { NavigationService } from "@/services/navigationService";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function QuickActions() {
  return (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => NavigationService.toExplore()}
        >
          <Ionicons name="search-outline" size={20} color="#fff" />
          <Text style={styles.quickActionText}>
            Search Proteins
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => NavigationService.toFavorites()}
        >
          <Ionicons name="bookmark-outline" size={20} color="#fff" />
          <Text style={styles.quickActionText}>Favorites</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text.white,
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
