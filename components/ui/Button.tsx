import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "../../styles/theme";
import globalStyles from "../../styles/globalStyles";

type ButtonVariant = "primary" | "success" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<TouchableOpacityProps, "style"> {
  readonly title: string;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly icon?: keyof typeof MCIcons.glyphMap;
  readonly iconPosition?: "left" | "right";
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "right",
  onPress,
  style,
  textStyle,
  ...props
}: Readonly<ButtonProps>) {
  const buttonStyles = [
    globalStyles.buttonBase,
    getVariantStyles(variant),
    getSizeStyles(size),
    (loading || disabled) && globalStyles.buttonDisabled,
    style,
  ];

  const textStyles = [
    globalStyles.buttonText,
    getVariantTextStyles(variant),
    getSizeTextStyles(size),
    textStyle,
  ];

  const handlePress = (event: any) => {
    if (!loading && !disabled && onPress) {
      onPress(event);
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={loading || disabled}
      activeOpacity={0.8}
      {...props}
    >
      <View style={globalStyles.buttonContent}>
        {loading ? (
          <ActivityIndicator color={getLoadingColor(variant)} size="small" />
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <MCIcons
                name={icon}
                size={getIconSize(size)}
                color={getIconColor(variant)}
                style={{ marginRight: theme.spacing.sm }}
              />
            )}
            <Text style={textStyles}>{title}</Text>
            {icon && iconPosition === "right" && (
              <MCIcons
                name={icon}
                size={getIconSize(size)}
                color={getIconColor(variant)}
                style={globalStyles.buttonIcon}
              />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

function getVariantStyles(variant: ButtonVariant): ViewStyle {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: theme.colors.github,
      };
    case "success":
      return {
        backgroundColor: theme.colors.success,
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
      };
    case "outline":
      return {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: theme.colors.text.white,
      };
    default:
      return {};
  }
}

function getVariantTextStyles(variant: ButtonVariant): TextStyle {
  // All variants use white text
  return {
    color: theme.colors.text.white,
  };
}

function getSizeStyles(size: ButtonSize): ViewStyle {
  switch (size) {
    case "sm":
      return {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        minHeight: 40,
      };
    case "lg":
      return {
        paddingVertical: theme.spacing.xl,
        paddingHorizontal: theme.spacing["2xl"],
        minHeight: 56,
      };
    default:
      return {};
  }
}

function getSizeTextStyles(size: ButtonSize): TextStyle {
  switch (size) {
    case "sm":
      return {
        fontSize: theme.typography.fontSize.sm,
      };
    case "lg":
      return {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
      };
    default:
      return {};
  }
}

function getIconSize(size: ButtonSize): number {
  switch (size) {
    case "sm":
      return 16;
    case "lg":
      return 24;
    default:
      return 20;
  }
}

function getIconColor(variant: ButtonVariant): string {
  // All variants use white icons
  return theme.colors.text.white;
}

function getLoadingColor(variant: ButtonVariant): string {
  return theme.colors.text.white;
}
