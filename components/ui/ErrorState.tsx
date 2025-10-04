import React from "react";
import { View, Text, StyleProp, ViewStyle } from "react-native";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "../../styles/theme";
import globalStyles from "../../styles/globalStyles";
import Button from "./Button";

interface ErrorStateProps {
  readonly title?: string;
  readonly message: string;
  readonly onRetry?: () => void;
  readonly retryText?: string;
  readonly icon?: keyof typeof MCIcons.glyphMap;
  readonly style?: StyleProp<ViewStyle>;
}

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryText = "Retry",
  icon = "alert-circle",
  style,
}: Readonly<ErrorStateProps>) {
  return (
    <View style={[globalStyles.emptyState, style]}>
      <MCIcons name={icon} size={64} color={theme.colors.error} />
      <Text
        style={[globalStyles.emptyStateTitle, { color: theme.colors.error }]}
      >
        {title}
      </Text>
      <Text
        style={[
          globalStyles.emptyStateSubtitle,
          { marginBottom: theme.spacing["3xl"] },
        ]}
      >
        {message}
      </Text>
      {onRetry && (
        <Button
          title={retryText}
          variant="primary"
          onPress={onRetry}
          style={{ backgroundColor: theme.colors.primary.light }}
        />
      )}
    </View>
  );
}
