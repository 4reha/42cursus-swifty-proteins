// app/login.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { globalStyles } from '@/styles/globalStyles';
import { theme } from '@/styles/theme';
import { Ionicons, MaterialCommunityIcons as MCIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function LoginScreen() {
  const {
    loginWithPassword,
    loginWithGitHub,
    loginWithBiometric,
    enableBiometric,
    isBiometricSupported,
    isBiometricEnrolled,
    isBiometricEnabled,
    isLoading,
    hasGitHubAccount,
  } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [hasGitHubAcc, setHasGitHubAcc] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);

  const checkAccounts = useCallback(async () => {
    const githubExists = await hasGitHubAccount();
    setHasGitHubAcc(githubExists);
  }, [hasGitHubAccount]);

  useEffect(() => {
    checkAccounts();

  }, [checkAccounts, isBiometricSupported, isBiometricEnrolled, isBiometricEnabled, isLoading]);

  const handlePasswordAuth = async () => {
    if (!email || !password) {
      showToast('Please enter email and password');
      return;
    }

    try {
      setAuthLoading(true);
      await loginWithPassword(email, password);

      // Show biometric setup prompt after successful login
      if (isBiometricSupported && isBiometricEnrolled && !isBiometricEnabled) {
        // Add a longer delay to ensure authentication state is fully updated
        setTimeout(() => {
          Alert.alert(
            'Enable Biometric Login',
            'Would you like to enable biometric authentication for faster login next time?',
            [
              { text: 'Not Now', style: 'cancel' },
              {
                text: 'Enable',
                onPress: async () => {
                  try {
                    // Wait a bit more to ensure state is updated
                    await new Promise(resolve => setTimeout(resolve, 200));
                    await enableBiometric();
                    showToast('Biometric authentication enabled!');
                  } catch {
                    showToast('Failed to enable biometric authentication');
                  }
                }
              }
            ]
          );
        }, 2000);
      }
    } catch (error: any) {
      showToast(error.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    try {
      setAuthLoading(true);
      const success = await loginWithGitHub();

      // Only show biometric setup prompt if login was successful
      if (success && isBiometricSupported && isBiometricEnrolled && !isBiometricEnabled) {
        // Add a longer delay to ensure authentication state is fully updated
        setTimeout(() => {
          Alert.alert(
            'Enable Biometric Login',
            'Would you like to enable biometric authentication for faster login next time?',
            [
              { text: 'Not Now', style: 'cancel' },
              {
                text: 'Enable',
                onPress: async () => {
                  try {
                    // Wait a bit more to ensure state is updated
                    await new Promise(resolve => setTimeout(resolve, 200));
                    await enableBiometric();
                    showToast('Biometric authentication enabled!');
                  } catch {
                    showToast('Failed to enable biometric authentication');
                  }
                }
              }
            ]
          );
        }, 2000);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to authenticate with GitHub');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      setAuthLoading(true);
      const success = await loginWithBiometric();

      if (!success) {
        showToast('Biometric authentication was not successful');
      }
    } catch (error: any) {
      showToast(error.message || 'Biometric authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };


  const getBiometricLabel = () => {
    if (Platform.OS === 'ios') {
      return 'Touch ID / Face ID';
    }
    return 'Fingerprint';
  };

  if (isLoading || authLoading) {
    return (
      <View style={[globalStyles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        {/* App Logo */}
        <View style={globalStyles.logoContainer}>
          <Image
            source={require('@/assets/icon.png')}
            style={{
              width: 80,
              height: 80,
              resizeMode: 'contain'
            }}
          />
        </View>

        {/* Loading Spinner */}
        <ActivityIndicator size="large" color={theme.colors.text.white} />

        {/* Loading Text */}
        <Text style={[globalStyles.bodyText, { color: theme.colors.text.white, marginTop: theme.spacing.lg }]}>
          Authenticating...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[globalStyles.container]}
    >
      <ScrollView
        contentContainerStyle={globalStyles.centeredContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: theme.spacing["4xl"] }}>
          <View style={globalStyles.logoContainer}>
            <MCIcons name="molecule" size={60} color={theme.colors.text.white} />
          </View>
          <Text style={globalStyles.title}>Protein Visualizer</Text>
          <Text style={globalStyles.subtitle}>42 School Project</Text>
        </View>

        {/* Biometric Login (if enabled) */}
        {isBiometricSupported && isBiometricEnrolled && isBiometricEnabled && (
          <>
            <TouchableOpacity
              style={[globalStyles.buttonBase, globalStyles.buttonPrimary, {
                backgroundColor: theme.colors.success,
                shadowColor: theme.colors.shadow.medium,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4
              }]}
              onPress={handleBiometricAuth}
              disabled={authLoading}
            >
              <View style={globalStyles.buttonContent}>
                <Ionicons name="finger-print" size={24} color={theme.colors.text.white} />
                <Text style={[globalStyles.buttonText, { marginLeft: theme.spacing.sm }]}>
                  {getBiometricLabel()}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={globalStyles.divider}>
              <View style={globalStyles.dividerLine} />
              <Text style={globalStyles.dividerText}>OR</Text>
              <View style={globalStyles.dividerLine} />
            </View>
          </>
        )}

        {/* Password Login Button */}
        <TouchableOpacity
          style={[globalStyles.buttonBase, {
            backgroundColor: theme.colors.background.card,
            borderWidth: 1,
            borderColor: theme.colors.border.medium
          }]}
          onPress={() => setShowPasswordForm(!showPasswordForm)}
        >
          <View style={globalStyles.buttonContent}>
            <Ionicons name="lock-closed" size={24} color={theme.colors.text.white} />
            <Text style={[globalStyles.buttonText, { marginLeft: theme.spacing.sm }]}>
              {showPasswordForm ? 'Hide Email & Password' : 'Email & Password'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Password Login Form (shown when button is clicked) */}
        {showPasswordForm && (
          <View style={{ marginBottom: theme.spacing.lg }}>

            {/* Email Input */}
            <View style={globalStyles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.text.whiteLight} style={{ marginRight: theme.spacing.sm }} />
              <TextInput
                style={globalStyles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={theme.colors.text.whiteLight}
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />
            </View>

            {/* Password Input */}
            <View style={globalStyles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.whiteLight} style={{ marginRight: theme.spacing.sm }} />
              <TextInput
                ref={passwordInputRef}
                style={globalStyles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                placeholderTextColor={theme.colors.text.whiteLight}
                returnKeyType="done"
                onSubmitEditing={handlePasswordAuth}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={{ padding: theme.spacing.sm }}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={theme.colors.text.whiteLight}
                />
              </TouchableOpacity>
            </View>

          </View>
        )}

        {/* GitHub Login Button */}
        <TouchableOpacity
          style={[globalStyles.buttonBase, globalStyles.buttonPrimary, {
            borderWidth: 2,
            borderColor: theme.colors.text.white,
            backgroundColor: theme.colors.github,
            shadowColor: theme.colors.shadow.medium,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4
          }]}
          onPress={handleGitHubAuth}
          disabled={authLoading}
        >
          <View style={globalStyles.buttonContent}>
            <Ionicons name="logo-github" size={24} color={theme.colors.text.white} />
            <Text style={[globalStyles.buttonText, { marginLeft: theme.spacing.sm }]}>
              {hasGitHubAcc ? 'Continue with GitHub' : 'Sign in with GitHub'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Info Card */}
        <View style={globalStyles.infoContainer}>
          <Ionicons name="information-circle" size={20} color={theme.colors.text.whiteLight} style={globalStyles.infoIcon} />
          <Text style={globalStyles.infoText}>
            Each login method is independent. Choose the one that works best for you.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}