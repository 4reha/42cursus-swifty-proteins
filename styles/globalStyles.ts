import { StyleSheet } from "react-native";
import { theme } from "./theme";

// Global styles that can be reused across components
export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },

  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },

  // Content containers
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },

  centeredContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },

  // Header styles
  gradientHeader: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing["3xl"],
    paddingBottom: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },

  headerRow: {
    ...theme.mixins.layout.row,
    justifyContent: "space-between",
  },

  // Card styles
  card: {
    ...theme.mixins.card.base,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },

  // Button styles - base
  buttonBase: {
    ...theme.mixins.button.base,
    marginBottom: theme.spacing.md,
  },

  buttonPrimary: {
    ...theme.mixins.button.primary,
  },

  buttonSuccess: {
    ...theme.mixins.button.success,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonContent: {
    ...theme.mixins.layout.row,
    justifyContent: "center",
    minHeight: 24,
  },

  buttonText: {
    color: theme.colors.text.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: "center",
    flex: 0,
  },

  buttonIcon: {
    marginLeft: theme.spacing.sm,
  },

  // Text styles
  title: {
    ...theme.mixins.text.title,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
    textShadowColor: theme.colors.shadow.medium,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  subtitle: {
    ...theme.mixins.text.subtitle,
    textAlign: "center",
  },

  screenTitle: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text.white,
    textShadowColor: theme.colors.shadow.medium,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  screenSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.whiteTransparent,
    marginTop: 2,
    fontWeight: theme.typography.fontWeight.medium,
  },

  bodyText: {
    ...theme.mixins.text.body,
  },

  captionText: {
    ...theme.mixins.text.caption,
  },

  // Input styles
  inputContainer: {
    ...theme.mixins.layout.row,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },

  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },

  // Error styles
  errorContainer: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    borderColor: theme.colors.error,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.mixins.layout.row,
  },

  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    flex: 1,
  },

  // Loading styles
  loadingContainer: {
    ...theme.mixins.layout.center,
    flex: 1,
  },

  // Empty state styles
  emptyState: {
    ...theme.mixins.layout.center,
    paddingVertical: theme.spacing["6xl"],
  },

  emptyStateTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },

  emptyStateSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.light,
    textAlign: "center",
  },

  // Divider styles
  divider: {
    ...theme.mixins.layout.row,
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.strong,
  },

  dividerText: {
    marginHorizontal: theme.spacing.lg,
    color: theme.colors.text.whiteTransparent,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  // Info container
  infoContainer: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.mixins.layout.row,
    alignItems: "flex-start",
  },

  infoIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },

  infoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.whiteLight,
    lineHeight: theme.typography.lineHeight.normal,
    flex: 1,
  },

  // Logo container
  logoContainer: {
    width: theme.spacing["8xl"],
    height: theme.spacing["8xl"],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.overlayStrong,
    ...theme.mixins.layout.center,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.xl,
  },

  // Profile button
  profileButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.colors.background.overlayStrong,
  },
});

export default globalStyles;
