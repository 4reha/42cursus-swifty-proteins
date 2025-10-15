/**
 * Home Screen (Refactored)
 * Main dashboard displaying user info, features, and GitHub data
 */

import { AppInfoCard } from "@/components/home/AppInfoCard";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { GitHubStatsCard } from "@/components/home/GitHubStatsCard";
import { GitHubUserInfo } from "@/components/home/GitHubUserInfo";
import { QuickActions } from "@/components/home/QuickActions";
import { RecentRepositories } from "@/components/home/RecentRepositories";
import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/AuthContext";
import { Image } from "expo-image";
import { StyleSheet } from "react-native";

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        isAuthenticated && user?.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.githubHeaderImage}
          />
        ) : (
          <Image
            source={require("@/assets/partial-react-logo.png")}
            style={styles.reactLogo}
          />
        )
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* App Information */}
      <AppInfoCard />

      {/* User Information Display */}
      {isAuthenticated && user && <GitHubUserInfo user={user} />}

      {/* Features Overview */}
      <FeaturesGrid />

      {/* GitHub Statistics */}
      {isAuthenticated && user?.githubData && <GitHubStatsCard user={user} />}

      {/* Recent Repositories */}
      {isAuthenticated && user && <RecentRepositories user={user} />}

      {/* Quick Actions */}
      <QuickActions />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  githubHeaderImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
