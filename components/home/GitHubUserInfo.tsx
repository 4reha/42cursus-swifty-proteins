/**
 * GitHubUserInfo Component
 * Displays GitHub user information including avatar, bio, stats
 */

import { theme } from "@/styles/theme";
import { User } from "@/types/auth.types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface GitHubUserInfoProps {
  user: User;
}

export function GitHubUserInfo({ user }: Readonly<GitHubUserInfoProps>) {
  return (
    <>
      <View style={styles.userInfoContainer}>
        <View style={styles.userCard}>
          <View style={styles.userDetails}>
            <View style={styles.userHeader}>
              <Text style={styles.username}>
                {user.githubData?.name || user.username}
              </Text>
            </View>

            <Text style={styles.userEmail}>{user.email}</Text>

            {user.githubData?.bio && (
              <Text style={styles.userBio}>
                {user.githubData?.bio}
              </Text>
            )}

            {user.githubData?.location && (
              <View style={styles.userLocation}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.locationText}>
                  {user.githubData?.location}
                </Text>
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
                <Text style={styles.authMethod}>
                  {user.authMethod === "github" ? "GitHub" : "Password"}
                </Text>
              </View>
            </View>

            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={styles.statText}>Active Session</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color="#4CAF50"
                />
                <Text style={styles.statText}>Secure</Text>
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
                  <Text style={styles.githubStatNumber}>
                    {user.githubData?.public_repos || 0}
                  </Text>
                  <Text style={styles.githubStatLabel}>Repos</Text>
                </View>
                <View style={styles.githubStatItem}>
                  <Ionicons name="people-outline" size={16} color="#4A90E2" />
                  <Text style={styles.githubStatNumber}>
                    {user.githubData?.followers || 0}
                  </Text>
                  <Text style={styles.githubStatLabel}>
                    Followers
                  </Text>
                </View>
                <View style={styles.githubStatItem}>
                  <Ionicons
                    name="person-add-outline"
                    size={16}
                    color="#4A90E2"
                  />
                  <Text style={styles.githubStatNumber}>
                    {user.githubData?.following || 0}
                  </Text>
                  <Text style={styles.githubStatLabel}>
                    Following
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.githubProfileContainer}>
        <View style={styles.githubProfileHeader}>
          <Ionicons name="logo-github" size={24} color="#4A90E2" />
          <Text style={styles.githubProfileTitle}>
            GitHub Profile
          </Text>
        </View>

        <View style={styles.githubProfileInfo}>
          {user.githubData?.bio && (
            <View style={styles.githubInfoItem}>
              <Ionicons name="document-text-outline" size={16} color="#666" />
              <Text style={styles.githubInfoText}>
                {user.githubData?.bio}
              </Text>
            </View>
          )}

          {user.githubData?.location && (
            <View style={styles.githubInfoItem}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.githubInfoText}>
                {user.githubData?.location}
              </Text>
            </View>
          )}

          {user.githubData?.company && (
            <View style={styles.githubInfoItem}>
              <Ionicons name="business-outline" size={16} color="#666" />
              <Text style={styles.githubInfoText}>
                {user.githubData?.company}
              </Text>
            </View>
          )}

          {user.githubData?.blog && (
            <View style={styles.githubInfoItem}>
              <Ionicons name="link-outline" size={16} color="#666" />
              <Text style={styles.githubInfoText}>
                {user.githubData?.blog}
              </Text>
            </View>
          )}
        </View>
      </View>
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
    color: theme.colors.text.white,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.8,
    color: theme.colors.text.light,
  },
  userBio: {
    fontSize: 13,
    opacity: 0.9,
    color: theme.colors.text.light,
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
    color: theme.colors.text.light,
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
    color: theme.colors.text.light,
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
    color: theme.colors.text.light,
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
    color: theme.colors.text.light,
    flex: 1,
  },
});
