// app/_layout.tsx
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '@/styles/theme';

function RootLayoutNav() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary
      }}>
        <ActivityIndicator size="large" color={theme.colors.text.white} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false, // Prevent swipe back
      }}
    >
      {/* Login screen - always accessible */}
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          gestureEnabled: false,
          // Prevent back navigation from login
          headerLeft: () => null,
        }}
      />

      {/* Main app screens - only accessible when authenticated */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          gestureEnabled: false,
          // Prevent back navigation to login
          headerLeft: () => null,
        }}
      />

      {/* Initial index screen that redirects */}
      {/* <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      /> */}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ToastProvider>
      <AuthProvider>
        <FavoritesProvider>
          <RootLayoutNav />
        </FavoritesProvider>
      </AuthProvider>
    </ToastProvider>
  );
}