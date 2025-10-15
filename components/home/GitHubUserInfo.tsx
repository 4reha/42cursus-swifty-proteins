/**
 * GitHubUserInfo Component
 * Displays GitHub user information including avatar, bio, stats
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { User } from "@/types/auth.types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface GitHubUserInfoProps {
  user: User;
}

export function GitHubUserInfo({ user }: Readonly<GitHubUserInfoProps>) {
  return (
    <>
      <ThemedView style={styles.userInfoContainer}>
        <View style={styles.userCard}>
          <View style={styles.userDetails}>
            <View style={styles.userHeader}>
              <ThemedText type="defaultSemiBold" style={styles.username}>
                {user.githubData?.name || user.username}
              </ThemedText>
            </View>

            <ThemedText style={styles.userEmail}>{user.email}</ThemedText>

            {user.githubData?.bio && (
              <ThemedText style={styles.userBio}>
                {user.githubData?.bio}
              </ThemedText>
            )}

            {user.githubData?.location && (
              <View style={styles.userLocation}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <ThemedText style={styles.locationText}>
                  {user.githubData?.location}
                </ThemedText>
              </View>
            )}

            <View style={styles.authMethodContainer}>
              <View style={styles.authMethodBadge}>
                <Ionicons
                  name={
                    user.authMethod === "github" ? "logo-github" : "lock-closed"
                  }
                  size={14}
                  color="#4A90E2"
                />
                <ThemedText style={styles.authMethod}>
                  {user.authMethod === "github" ? "GitHub" : "Password"}
                </ThemedText>
              </View>
            </View>

            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <ThemedText style={styles.statText}>Active Session</ThemedText>
              </View>
              <View style={styles.statItem}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color="#4CAF50"
                />
                <ThemedText style={styles.statText}>Secure</ThemedText>
              </View>
            </View>

            {user.githubData && (
              <View style={styles.githubStats}>
                <View style={styles.githubStatItem}>
                  <Ionicons
                    name="git-branch-outline"
                    size={16}
                    color="#4A90E2"
                  />
                  <ThemedText style={styles.githubStatNumber}>
                    {user.githubData?.public_repos || 0}
                  </ThemedText>
                  <ThemedText style={styles.githubStatLabel}>Repos</ThemedText>
                </View>
                <View style={styles.githubStatItem}>
                  <Ionicons name="people-outline" size={16} color="#4A90E2" />
                  <ThemedText style={styles.githubStatNumber}>
                    {user.githubData?.followers || 0}
                  </ThemedText>
                  <ThemedText style={styles.githubStatLabel}>
                    Followers
                  </ThemedText>
                </View>
                <View style={styles.githubStatItem}>
                  <Ionicons
                    name="person-add-outline"
                    size={16}
                    color="#4A90E2"
                  />
                  <ThemedText style={styles.githubStatNumber}>
                    {user.githubData?.following || 0}
                  </ThemedText>
                  <ThemedText style={styles.githubStatLabel}>
                    Following
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.githubProfileContainer}>
        <View style={styles.githubProfileHeader}>
          <Ionicons name="logo-github" size={24} color="#4A90E2" />
          <ThemedText type="subtitle" style={styles.githubProfileTitle}>
            GitHub Profile
          </ThemedText>
        </View>

        <View style={styles.githubProfileInfo}>
          {user.githubData?.bio && (
            <View style={styles.githubInfoItem}>
              <Ionicons name="document-text-outline" size={16} color="#666" />
              <ThemedText style={styles.githubInfoText}>
                {user.githubData?.bio}
              </ThemedText>
            </View>
          )}

          {user.githubData?.location && (
            <View style={styles.githubInfoItem}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <ThemedText style={styles.githubInfoText}>
                {user.githubData?.location}
              </ThemedText>
            </View>
          )}

          {user.githubData?.company && (
            <View style={styles.githubInfoItem}>
              <Ionicons name="business-outline" size={16} color="#666" />
              <ThemedText style={styles.githubInfoText}>
                {user.githubData?.company}
              </ThemedText>
            </View>
          )}

          {user.githubData?.blog && (
            <View style={styles.githubInfoItem}>
              <Ionicons name="link-outline" size={16} color="#666" />
              <ThemedText style={styles.githubInfoText}>
                {user.githubData?.blog}
              </ThemedText>
            </View>
          )}
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  userInfoContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userCard: {
    flexDirection: "column",
    gap: 16,
  },
  userDetails: {
    flex: 1,
    gap: 8,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.8,
    color: "#fff",
  },
  userBio: {
    fontSize: 13,
    opacity: 0.9,
    color: "#fff",
    fontStyle: "italic",
    marginTop: 4,
  },
  userLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    opacity: 0.8,
    color: "#fff",
  },
  authMethodContainer: {
    marginTop: 4,
  },
  authMethodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(74, 144, 226, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.3)",
    alignSelf: "flex-start",
  },
  authMethod: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A90E2",
  },
  userStats: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    opacity: 0.7,
  },
  githubStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  githubStatItem: {
    alignItems: "center",
    gap: 4,
  },
  githubStatNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A90E2",
  },
  githubStatLabel: {
    fontSize: 12,
    opacity: 0.8,
    color: "#fff",
    textAlign: "center",
  },
  githubProfileContainer: {
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: "rgba(74, 144, 226, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.2)",
  },
  githubProfileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  githubProfileTitle: {
    color: "#4A90E2",
    fontSize: 18,
    fontWeight: "600",
  },
  githubProfileInfo: {
    gap: 12,
  },
  githubInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  githubInfoText: {
    fontSize: 14,
    color: "#fff",
    flex: 1,
  },
});
