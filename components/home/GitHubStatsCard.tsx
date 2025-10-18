/**
 * GitHubStatsCard Component
 * Displays GitHub statistics in a card layout
 */

import { theme } from "@/styles/theme";
import { User } from "@/types/auth.types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface GitHubStatsCardProps {
  user: User;
}

export function GitHubStatsCard({ user }: Readonly<GitHubStatsCardProps>) {
  if (!user.githubData) return null;

  return (
    <View style={styles.githubStatsContainer}>
      <Text style={styles.githubStatsTitle}>GitHub Statistics</Text>
      <View style={styles.githubStatsGrid}>
        <View style={styles.githubStatCard}>
          <Ionicons name="git-branch-outline" size={24} color="#4A90E2" />
          <Text style={styles.githubStatNumber}>
            {user.githubData.public_repos || 0}
          </Text>
          <Text style={styles.githubStatLabel}>Public Repos</Text>
        </View>
        <View style={styles.githubStatCard}>
          <Ionicons name="people-outline" size={24} color="#4A90E2" />
          <Text style={styles.githubStatNumber}>
            {user.githubData.followers || 0}
          </Text>
          <Text style={styles.githubStatLabel}>Followers</Text>
        </View>
        <View style={styles.githubStatCard}>
          <Ionicons name="person-add-outline" size={24} color="#4A90E2" />
          <Text style={styles.githubStatNumber}>
            {user.githubData.following || 0}
          </Text>
          <Text style={styles.githubStatLabel}>Following</Text>
        </View>
        <View style={styles.githubStatCard}>
          <Ionicons name="code-slash-outline" size={24} color="#4A90E2" />
          <Text style={styles.githubStatNumber}>
            {user.githubData.public_gists || 0}
          </Text>
          <Text style={styles.githubStatLabel}>Gists</Text>
        </View>
      </View>
    </View>
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
  githubStatsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text.white,
    marginBottom: 12,
  },
  githubStatLabel: {
    fontSize: 12,
    color: theme.colors.text.light,
  },
});
