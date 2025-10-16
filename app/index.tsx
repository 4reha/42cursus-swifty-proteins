import { useAuth } from "@/contexts/AuthContext";
import { NavigationService } from "@/services/navigationService";
import { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

export default function Index() {
  const { isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth state to be determined
    if (!isLoading) {
      // CRITICAL: Always redirect to login first
      // This ensures the "always show login" requirement is met
      NavigationService.toLogin();
    }
  }, [isLoading]);

  return (
    <View style={styles.container}>
      {/* Splash Screen - Shows for 2-3 seconds while checking auth */}
      <View style={styles.splashContent}>
        <Image
          source={require("@/assets/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
  },
  splashContent: {
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 48,
  },
  loader: {
    marginTop: 24,
  },
});
