// Color palette
export const colors = {
  // Primary gradient colors
  primary: {
    light: "#1a1a2e",
    dark: "#1a1a2e",
    gradient: ["#1a1a2e", "#1a1a2e"],
  },

  // UI Colors
  background: {
    primary: "#1a1a2e",
    card: "#0f1020",
    overlay: "rgba(255, 255, 255, 0.05)",
    overlayStrong: "rgba(255, 255, 255, 0.2)",
  },

  // Text colors
  text: {
    primary: "#333333",
    secondary: "#666666",
    muted: "#999999",
    light: "#bbbbbb",
    white: "#ffffff",
    whiteTransparent: "#ffffff90",
    whiteLight: "#ffffff60",
  },

  // State colors
  success: "#34C759",
  error: "#FF6B6B",
  warning: "#F44336",
  info: "#667eea",

  // GitHub brand
  github: "#24292e",

  // Border colors
  border: {
    light: "#f0f0f0",
    medium: "rgba(255, 255, 255, 0.1)",
    strong: "rgba(255, 255, 255, 0.3)",
  },

  // Shadow colors
  shadow: {
    light: "rgba(0, 0, 0, 0.1)",
    medium: "rgba(0, 0, 0, 0.2)",
    strong: "rgba(0, 0, 0, 0.3)",
  },
} as const;

// Typography
export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 22,
    "3xl": 24,
    "4xl": 28,
    "5xl": 32,
    "6xl": 48,
    "7xl": 60,
  },

  // Font weights
  fontWeight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  },

  // Line heights
  lineHeight: {
    tight: 18,
    normal: 20,
    relaxed: 22,
    loose: 24,
  },
} as const;

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 40,
  "5xl": 48,
  "6xl": 60,
  "7xl": 80,
  "8xl": 100,
  "9xl": 120,
} as const;

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  full: 50,
} as const;

// Shadows
export const shadows = {
  sm: {
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Animation durations
export const animations = {
  fast: 150,
  normal: 200,
  slow: 300,
} as const;

// Common style mixins
export const mixins = {
  // Button styles
  button: {
    base: {
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      flexDirection: "row" as const,
      minHeight: 48,
    },
    primary: {
      backgroundColor: colors.github,
    },
    success: {
      backgroundColor: colors.success,
    },
  },

  // Card styles
  card: {
    base: {
      backgroundColor: colors.background.card,
      borderRadius: borderRadius.lg,
      ...shadows.md,
    },
  },

  // Text styles
  text: {
    title: {
      fontSize: typography.fontSize["5xl"],
      fontWeight: typography.fontWeight.extrabold,
      color: colors.text.white,
    },
    subtitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.whiteTransparent,
    },
    body: {
      fontSize: typography.fontSize.base,
      color: colors.text.primary,
      lineHeight: typography.lineHeight.normal,
    },
    caption: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
  },

  // Layout helpers
  layout: {
    center: {
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    row: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
    },
    column: {
      flexDirection: "column" as const,
    },
  },
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  mixins,
} as const;

export type Theme = typeof theme;
