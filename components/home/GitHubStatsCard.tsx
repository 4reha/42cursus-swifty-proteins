/**
 * GitHubStatsCard Component
 * Displays GitHub statistics in a card layout
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { User } from "@/types/auth.types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface GitHubStatsCardProps {
  user: User;
}

export function GitHubStatsCard({ user }: Readonly<GitHubStatsCardProps>) {
  if (!user.githubData) return null;

  return (
    <ThemedView style={styles.githubStatsContainer}>
      <ThemedText type="subtitle">GitHub Statistics</ThemedText>
      <View style={styles.githubStatsGrid}>
        <View style={styles.githubStatCard}>
          <Ionicons name="git-branch-outline" size={24} color="#4A90E2" />
          <ThemedText style={styles.githubStatNumber}>
            {user.githubData.public_repos || 0}
          </ThemedText>
          <ThemedText style={styles.githubStatLabel}>Public Repos</ThemedText>
        </View>
        <View style={styles.githubStatCard}>
          <Ionicons name="people-outline" size={24} color="#4A90E2" />
          <ThemedText style={styles.githubStatNumber}>
            {user.githubData.followers || 0}
          </ThemedText>
          <ThemedText style={styles.githubStatLabel}>Followers</ThemedText>
        </View>
        <View style={styles.githubStatCard}>
          <Ionicons name="person-add-outline" size={24} color="#4A90E2" />
          <ThemedText style={styles.githubStatNumber}>
            {user.githubData.following || 0}
          </ThemedText>
          <ThemedText style={styles.githubStatLabel}>Following</ThemedText>
        </View>
        <View style={styles.githubStatCard}>
          <Ionicons name="code-slash-outline" size={24} color="#4A90E2" />
          <ThemedText style={styles.githubStatNumber}>
            {user.githubData.public_gists || 0}
          </ThemedText>
          <ThemedText style={styles.githubStatLabel}>Gists</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  githubStatsContainer: {
    marginBottom: 16,
  },
  githubStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  githubStatCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.2)",
    alignItems: "center",
    gap: 8,
  },
  githubStatNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  githubStatLabel: {
    fontSize: 12,
    color: "#666",
  },
});
