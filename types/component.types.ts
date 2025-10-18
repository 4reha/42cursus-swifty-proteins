/**
 * Component-related types
 * Naming convention: PascalCase with descriptive names
 */

import { ReactElement, ReactNode } from "react";
import {
  StyleProp,
  TextStyle,
  TouchableOpacityProps,
  ViewProps,
  ViewStyle,
} from "react-native";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";

/**
 * Button component types
 */
export type ButtonVariant = "primary" | "success" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<TouchableOpacityProps, "style"> & {
  readonly title: string;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly icon?: keyof typeof MCIcons.glyphMap;
  readonly iconPosition?: "left" | "right";
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
};

/**
 * Card component types
 */
export type CardProps = ViewProps & {
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
};

/**
 * Collapsible card component types
 */
export type CollapsibleCardProps = {
  readonly title: string;
  readonly children: ReactNode;
  readonly defaultExpanded?: boolean;
};

/**
 * Parallax scroll view types
 */
export type ParallaxScrollViewProps = {
  readonly children: ReactNode;
  readonly headerImage: ReactElement;
  readonly headerBackgroundColor: string;
};
