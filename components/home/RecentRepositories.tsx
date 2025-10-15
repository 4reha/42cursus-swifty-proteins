/**
 * RecentRepositories Component
 * Displays recent GitHub repositories
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { User } from "@/types/auth.types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface RecentRepositoriesProps {
  user: User;
}

export function RecentRepositories({
  user,
}: Readonly<RecentRepositoriesProps>) {
  if (
    !user.githubData?.recent_repos ||
    user.githubData.recent_repos.length === 0
  ) {
    return null;
  }

  return (
    <ThemedView style={styles.recentReposContainer}>
      <ThemedText type="subtitle">Recent Repositories</ThemedText>
      <View style={styles.reposList}>
        {user.githubData.recent_repos.slice(0, 3).map((repo: any) => (
          <View key={repo.id || repo.name} style={styles.repoItem}>
            <View style={styles.repoHeader}>
              <Ionicons name="folder-outline" size={16} color="#4A90E2" />
              <ThemedText style={styles.repoName}>{repo.name}</ThemedText>
              {repo.private && (
                <Ionicons name="lock-closed" size={12} color="#666" />
              )}
            </View>
            {repo.description && (
              <ThemedText style={styles.repoDescription}>
                {repo.description}
              </ThemedText>
            )}
            <View style={styles.repoStats}>
              <View style={styles.repoStatItem}>
                <Ionicons name="star-outline" size={12} color="#FFD700" />
                <ThemedText style={styles.repoStatText}>
                  {repo.stargazers_count || 0}
                </ThemedText>
              </View>
              <View style={styles.repoStatItem}>
                <Ionicons name="git-branch-outline" size={12} color="#666" />
                <ThemedText style={styles.repoStatText}>
                  {repo.forks_count || 0}
                </ThemedText>
              </View>
              <View style={styles.repoStatItem}>
                <Ionicons name="code-outline" size={12} color="#666" />
                <ThemedText style={styles.repoStatText}>
                  {repo.language || "No language"}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  recentReposContainer: {
    marginBottom: 16,
  },
  reposList: {
    gap: 12,
    marginTop: 12,
  },
  repoItem: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    gap: 8,
  },
  repoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  repoName: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  repoDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  repoStats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  repoStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  repoStatText: {
    fontSize: 11,
    color: "#666",
  },
});
