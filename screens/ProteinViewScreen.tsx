import React, { useEffect } from "react";
import { SafeAreaView, ScrollView, BackHandler } from "react-native";
import { useLigandData } from "../services/queries";
import { GradientHeader, LoadingState, ErrorState } from "../components/ui";
import MoleculeInfo from "../components/protein/MoleculeInfo";
import MoleculeVisualization from "../components/protein/MoleculeVisualization";
import globalStyles from "../styles/globalStyles";

interface ProteinViewScreenProps {
  readonly ligandId: string;
  readonly onBack: () => void;
}

export default function ProteinViewScreen({
  ligandId,
  onBack,
}: Readonly<ProteinViewScreenProps>) {
  const {
    data: ligandData,
    isLoading,
    isParsing,
    error,
    refetch,
  } = useLigandData(ligandId);

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onBack();
        return true; // Prevent default behavior
      }
    );

    return () => backHandler.remove();
  }, [onBack]);

  if (isLoading || isParsing) {
    return (
      <LoadingState
        title={`Loading ${ligandId}`}
        subtitle={
          isParsing
            ? "Parsing molecular structure..."
            : "Downloading molecular data..."
        }
        useGradient
      />
    );
  }

  if (error) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <GradientHeader title={ligandId} showBackButton onBackPress={onBack} />
        <ErrorState
          title="Failed to Load"
          message={error.message || "Unknown error occurred"}
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  if (!ligandData) {
    return null;
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <GradientHeader title={ligandId} showBackButton onBackPress={onBack} />

      <ScrollView
        style={globalStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <MoleculeInfo data={ligandData} />
        <MoleculeVisualization data={ligandData} />
      </ScrollView>
    </SafeAreaView>
  );
}
