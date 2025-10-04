import React, { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as LocalAuthentication from "expo-local-authentication";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui";
import { theme } from "../styles/theme";
import globalStyles from "../styles/globalStyles";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    loginWithGitHub,
    loginWithBiometric,
    setupBiometric,
    hasPreviouslyAuthenticated,
    isBiometricSetup,
    user,
  } = useAuth();

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricSupported(compatible && enrolled);
    } catch (error) {
      console.error("Error checking biometric support:", error);
    }
  };

  const showBiometricSetupDialog = () => {
    Alert.alert(
      "Set up Biometric Authentication",
      "Would you like to enable biometric authentication for faster login?",
      [
        {
          text: "Maybe Later",
          style: "cancel",
        },
        {
          text: "Enable",
          onPress: () => {
            setupBiometric().then((success) => {
              if (success) {
                Alert.alert(
                  "Success!",
                  "Biometric authentication is now enabled. You can use it for future logins."
                );
              } else {
                Alert.alert(
                  "Setup Failed",
                  "Could not set up biometric authentication. You can try again later in settings."
                );
              }
            });
          },
        },
      ]
    );
  };

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setAuthError(null);

    try {
      console.log("🔄 Starting GitHub authentication...");
      const success = await loginWithGitHub();

      if (success) {
        console.log("✅ GitHub authentication initiated successfully");
        // The AuthContext will handle the rest of the flow
        // If successful, the app will automatically show ProteinListScreen

        // After successful login, offer biometric setup
        setTimeout(() => {
          if (isBiometricSupported && !isBiometricSetup) {
            showBiometricSetupDialog();
          }
        }, 1000);
      } else {
        setAuthError("GitHub authentication was cancelled or failed");
        Alert.alert(
          "Authentication Failed",
          "GitHub authentication was cancelled or failed. Please try again."
        );
      }
    } catch (error) {
      console.error("❌ GitHub login error:", error);
      setAuthError("An error occurred during authentication");
      Alert.alert(
        "Error",
        "An unexpected error occurred during GitHub authentication. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    setAuthError(null);

    try {
      console.log("🔄 Starting biometric authentication...");
      const success = await loginWithBiometric();

      if (success) {
        console.log("✅ Biometric authentication successful");
        // AuthContext will automatically update and show ProteinListScreen
      } else {
        setAuthError("Biometric authentication failed");
        Alert.alert(
          "Authentication Failed",
          "Biometric authentication was cancelled or failed. Please use GitHub login instead."
        );
      }
    } catch (error) {
      console.error("❌ Biometric authentication error:", error);
      setAuthError("Biometric authentication error");
      Alert.alert(
        "Error",
        "An error occurred during biometric authentication. Please use GitHub login instead."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canUseBiometric =
    hasPreviouslyAuthenticated && isBiometricSetup && isBiometricSupported;

  return (
    <LinearGradient
      colors={theme.colors.primary.gradient}
      style={globalStyles.container}
    >
      <View style={globalStyles.centeredContent}>
        {/* Header Section */}
        <View
          style={{ alignItems: "center", marginBottom: theme.spacing["4xl"] }}
        >
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

        {/* Welcome Back Section */}
        {hasPreviouslyAuthenticated && user && (
          <View
            style={{ alignItems: "center", marginBottom: theme.spacing.md }}
          >
            <Text
              style={[
                globalStyles.subtitle,
                { fontSize: theme.typography.fontSize.lg },
              ]}
            >
              Welcome back,
            </Text>
            <Text
              style={[
                globalStyles.title,
                {
                  fontSize: theme.typography.fontSize["2xl"],
                  marginTop: theme.spacing.xs,
                },
              ]}
            >
              {user.name || user.login}
            </Text>
          </View>
        )}

        {/* Auth Form */}
        <View
          style={{
            backgroundColor: theme.colors.background.overlay,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.xl,
            borderWidth: 1,
            borderColor: theme.colors.border.medium,
          }}
        >
          {/* Error Message */}
          {authError && (
            <View style={globalStyles.errorContainer}>
              <MCIcons
                name="alert-rhombus-outline"
                size={20}
                color={theme.colors.error}
                style={{ marginRight: theme.spacing.md }}
              />
              <Text style={globalStyles.errorText}>{authError}</Text>
            </View>
          )}

          {/* GitHub OAuth Login - Always available */}
          <Button
            title="Continue with GitHub"
            variant="primary"
            icon="github"
            loading={isLoading}
            disabled={isLoading}
            onPress={handleGitHubLogin}
          />

          {/* Biometric Authentication - Only for returning users */}
          {canUseBiometric && (
            <>
              <View style={globalStyles.divider}>
                <View style={globalStyles.dividerLine} />
                <Text style={globalStyles.dividerText}>OR</Text>
                <View style={globalStyles.dividerLine} />
              </View>

              <Button
                title="Biometric Login"
                variant="success"
                icon="fingerprint"
                loading={isLoading}
                disabled={isLoading}
                onPress={handleBiometricAuth}
              />
            </>
          )}

          {/* Information text */}
          <View style={globalStyles.infoContainer}>
            <MCIcons
              name="information-outline"
              size={16}
              color={theme.colors.text.whiteLight}
              style={globalStyles.infoIcon}
            />
            {!hasPreviouslyAuthenticated || !canUseBiometric ? (
              <Text style={globalStyles.infoText}>
                Please authenticate with GitHub to access the protein
                visualizer.
              </Text>
            ) : (
              <Text style={globalStyles.infoText}>
                Choose your preferred authentication method to continue.
              </Text>
            )}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
