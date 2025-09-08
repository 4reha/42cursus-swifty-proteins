import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import ProteinListScreen from "./components/ProteinListScreen";

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, login, isLoading } = useAuth();

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return <SplashScreen onFinish={() => {}} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={login} />;
  }

  return <ProteinListScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
