/**
 * RecentRepositories Component
 * Displays recent GitHub repositories
 */

import { theme } from "@/styles/theme";
import { User } from "@/types/auth.types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

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
    <View style={styles.recentReposContainer}>
      <Text style={styles.recentReposTitle}>Recent Repositories</Text>
      <View style={styles.reposList}>
        {user.githubData.recent_repos.slice(0, 3).map((repo: any) => (
          <View key={repo.id || repo.name} style={styles.repoItem}>
            <View style={styles.repoHeader}>
              <Ionicons name="folder-outline" size={16} color="#4A90E2" />
              <Text style={styles.repoName}>{repo.name}</Text>
              {repo.private && (
                <Ionicons name="lock-closed" size={12} color="#666" />
              )}
            </View>
            {repo.description && (
              <Text style={styles.repoDescription}>
                {repo.description}
              </Text>
            )}
            <View style={styles.repoStats}>
              <View style={styles.repoStatItem}>
                <Ionicons name="star-outline" size={12} color="#FFD700" />
                <Text style={styles.repoStatText}>
                  {repo.stargazers_count || 0}
                </Text>
              </View>
              <View style={styles.repoStatItem}>
                <Ionicons name="git-branch-outline" size={12} color="#666" />
                <Text style={styles.repoStatText}>
                  {repo.forks_count || 0}
                </Text>
              </View>
              <View style={styles.repoStatItem}>
                <Ionicons name="code-outline" size={12} color="#666" />
                <Text style={styles.repoStatText}>
                  {repo.language || "No language"}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
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
  recentReposTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text.white,
    marginBottom: 12,
  },
  repoName: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    color: theme.colors.text.white,
  },
  repoDescription: {
    fontSize: 12,
    color: theme.colors.text.light,
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
    color: theme.colors.text.light,
  },
});
