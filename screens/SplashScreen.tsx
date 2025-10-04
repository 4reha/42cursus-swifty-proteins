import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View, Text } from "react-native";
import { theme } from "../styles/theme";
import globalStyles from "../styles/globalStyles";

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
    <LinearGradient
      colors={theme.colors.primary.gradient}
      style={globalStyles.container}
    >
      <View style={globalStyles.centeredContent}>
        {/* Header Section */}
        <View style={{ alignItems: "center" }}>
          <View style={globalStyles.logoContainer}>
            <MCIcons
              name="molecule"
              size={60}
              color={theme.colors.text.white}
            />
          </View>
          <Text style={globalStyles.title}>Protein Visualizer</Text>
          <Text style={globalStyles.subtitle}>42 School Project</Text>
        </View>
      </View>
    </LinearGradient>
  );
}
