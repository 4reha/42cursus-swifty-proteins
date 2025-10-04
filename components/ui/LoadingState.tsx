import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "../../styles/theme";
import globalStyles from "../../styles/globalStyles";

interface LoadingStateProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly icon?: keyof typeof MCIcons.glyphMap;
  readonly useGradient?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}

export default function LoadingState({
  title,
  subtitle,
  icon = "molecule",
  useGradient = false,
  style,
}: Readonly<LoadingStateProps>) {
  const content = (
    <View style={[globalStyles.loadingContainer, style]}>
      <MCIcons
        name={icon}
        size={80}
        color={theme.colors.text.white}
        style={{ marginBottom: theme.spacing["3xl"], opacity: 0.9 }}
      />
      <Text style={globalStyles.title}>{title}</Text>
      {subtitle && (
        <Text
          style={[
            globalStyles.subtitle,
            { marginBottom: theme.spacing["4xl"] },
          ]}
        >
          {subtitle}
        </Text>
      )}
      <ActivityIndicator
        size="large"
        color={theme.colors.text.white}
        style={{ transform: [{ scale: 1.5 }] }}
      />
    </View>
  );

  if (useGradient) {
    return (
      <LinearGradient
        colors={theme.colors.primary.gradient}
        style={{ flex: 1 }}
      >
        {content}
      </LinearGradient>
    );
  }

  return content;
}
