import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "../../styles/theme";
import globalStyles from "../../styles/globalStyles";

interface GradientHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly showBackButton?: boolean;
  readonly onBackPress?: () => void;
  readonly rightComponent?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export default function GradientHeader({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightComponent,
  style,
}: Readonly<GradientHeaderProps>) {
  return (
    <LinearGradient
      colors={theme.colors.primary.gradient}
      style={[globalStyles.gradientHeader, style]}
    >
      <View style={globalStyles.headerRow}>
        {showBackButton && (
          <TouchableOpacity
            style={{ ...globalStyles.profileButton, marginRight: 10 }}
            onPress={onBackPress}
          >
            <MCIcons
              name="arrow-left"
              size={24}
              color={theme.colors.text.white}
            />
          </TouchableOpacity>
        )}

        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={globalStyles.screenTitle}>{title}</Text>
          {subtitle && (
            <Text style={globalStyles.screenSubtitle}>{subtitle}</Text>
          )}
        </View>

        {rightComponent || <View style={{ width: 40 }} />}
      </View>
    </LinearGradient>
  );
}
