import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import ProteinListScreen from "./screens/ProteinListScreen";
import ProteinViewScreen from "./screens/ProteinViewScreen";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

type AppScreen = "splash" | "login" | "list" | "protein";

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("splash");
  const [selectedLigandId, setSelectedLigandId] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();

  console.log(
    "AppContent render - isAuthenticated:",
    isAuthenticated,
    "isLoading:",
    isLoading,
    "currentScreen:",
    currentScreen
  ); // Debug log

  // Handle splash screen
  if (currentScreen === "splash") {
    return <SplashScreen onFinish={() => setCurrentScreen("login")} />;
  }

  // Handle loading states
  if (isLoading) {
    return <SplashScreen onFinish={() => {}} />;
  }

  // Handle authentication
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Handle protein view screen
  if (currentScreen === "protein" && selectedLigandId) {
    return (
      <ProteinViewScreen
        ligandId={selectedLigandId}
        onBack={() => {
          setCurrentScreen("list");
          setSelectedLigandId(null);
        }}
      />
    );
  }

  // Default to protein list screen
  console.log("Rendering ProteinListScreen"); // Debug log
  return (
    <ProteinListScreen
      onLigandSelect={(ligandId: string) => {
        setSelectedLigandId(ligandId);
        setCurrentScreen("protein");
      }}
    />
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <StatusBar style="auto" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
