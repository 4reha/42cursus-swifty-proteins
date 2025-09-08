import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({
  onFinish,
}: Readonly<SplashScreenProps>) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000); // Show splash for 3 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🧬</Text>
        <Text style={styles.appName}>Protein Visualizer</Text>
        <Text style={styles.company}>42 Project</Text>
        <Text style={styles.tagline}>
          Heal the world, make it a better place
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 80,
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  company: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
