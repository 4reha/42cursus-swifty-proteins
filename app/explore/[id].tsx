/**
 * EXPLORE DETAIL PAGE - SHARE LOGGING
 *
 * This page includes comprehensive logging to track the share process:
 *
 * 🔗 [EXPLORE_DETAIL] - Component lifecycle and rendering
 * 🔗 [SHARE] - Share button click and data preparation
 * 📤 [SHARE_SERVICE] - Share service execution and Share.share() calls
 * 🔐 [AUTH] - Authentication state changes and sharing state management
 * 📱 [APP_STATE] - App state changes and background/foreground transitions
 *
 * To see the logs, open the React Native debugger or check the console output.
 * The logs will show the complete flow from button click to share completion/cancellation.
 */

import Molecule3DViewer from "@/components/Molecule3D";
import MoleculeInfo from "@/components/MoleculeInfo";
import { LIGAND_API_SVG_URL, LIGAND_API_URL } from "@/config/ligands";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useToast } from "@/contexts/ToastContext";
import useFetch from "@/hooks/useFetch";
import { ErrorHandler } from "@/services/errorHandler";
import { parseCIFData } from "@/services/ligandService";
import { NavigationService } from "@/services/navigationService";
import { shareLigand } from "@/services/shareService";
import { globalStyles } from "@/styles/globalStyles";
import { theme } from "@/styles/theme";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ExploreDetail() {
  const params = useLocalSearchParams();
  const id = params.id.toString().toUpperCase();
  const { showToast } = useToast();
  const { setSharingInProgress } = useAuth();
  const { isFavorite, toggleFavorite, canAddFavorite, getFavoritesCount, getMaxFavorites } = useFavorites();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<"2D" | "3D">("3D"); // Start with 3D
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const handleShare = async () => {
    try {
      setSharingInProgress(true);

      await shareLigand({
        ligandId: id,
        data,
        svgUrl,
        svgXml,
      });
      showToast("Ligand shared successfully!", 2000);
    } catch (error) {
      const errorMessage = ErrorHandler.handle(error, "Share");
      showToast(errorMessage, 2000);
    } finally {
      // Use a small delay to ensure app state changes are processed first
      setTimeout(() => {
        setSharingInProgress(false);
      }, 500);
    }
  };

  const handleToggleFavorite = async () => {
    setFavoriteLoading(true);
    try {
      const proteinData = {
        id,
        name: data?.name || "Unknown",
        type: data?.type || "Protein",
        lastViewed: new Date().toLocaleString(),
        atomCount: data?.atoms?.length || 0,
        bondCount: data?.bonds?.length || 0,
      };

      const wasFavorite = isFavorite(id);
      await toggleFavorite(proteinData);

      if (wasFavorite) {
        showToast("Removed from favorites", 2000);
      } else {
        showToast("Added to favorites", 2000);
      }
    } catch (error) {
      const errorMessage = ErrorHandler.handle(error, "Favorites");
      showToast(errorMessage, 2000);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refetch both SVG and CIF data
      await Promise.all([refetchSvg(), refetchCif()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Build URLs
  const svgUrl = `${LIGAND_API_SVG_URL}${id[0]}/${id}.svg`;
  const cifUrl = `${LIGAND_API_URL}${id}.cif`;

  // Fetch SVG
  const {
    data: svgResp,
    loading: svgLoading,
    error: svgError,
    refetch: refetchSvg,
  } = useFetch<string>(svgUrl, { responseType: "text" });

  // Fetch CIF
  const {
    data: cifResp,
    loading: cifLoading,
    error: cifError,
    refetch: refetchCif,
  } = useFetch<string>(cifUrl, { responseType: "text" });

  // Parse CIF data using useMemo to avoid re-parsing
  const data = useMemo(() => {
    if (!cifResp) return null;

    try {
      console.log("Parsing CIF data for:", id);
      const parsed = parseCIFData(cifResp, id);
      console.log("Parsed data:", {
        id: parsed.id,
        name: parsed.name,
        atomCount: parsed.atoms?.length || 0,
        bondCount: parsed.bonds?.length || 0,
        firstAtom: parsed.atoms?.[0],
        firstBond: parsed.bonds?.[0],
      });

      // Add SVG URL if available
      if (svgUrl) {
        parsed.svgUrl = svgUrl;
      }

      return parsed;
    } catch (e) {
      console.error("Failed to parse CIF data:", e);
      return null;
    }
  }, [cifResp, id, svgUrl]);

  // SVG XML for 2D view
  const svgXml = svgResp || null;

  if (!id) {
    return (
      <View
        style={[
          globalStyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: theme.colors.text.whiteLight }}>
          No ligand ID provided.
        </Text>
      </View>
    );
  }

  // Show loading state (but not when refreshing)
  if (cifLoading && !refreshing) {
    return (
      <View style={globalStyles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
          <View style={styles.leftGroup}>
            <TouchableOpacity
              onPress={() => NavigationService.goBack()}
              style={styles.backButton}
            >
              <MCIcons
                name="arrow-left"
                size={22}
                color={theme.colors.text.white}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ligand</Text>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading molecule {id}...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (cifError) {
    return (
      <View style={globalStyles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
          <View style={styles.leftGroup}>
            <TouchableOpacity
              onPress={() => NavigationService.goBack()}
              style={styles.backButton}
            >
              <MCIcons
                name="arrow-left"
                size={22}
                color={theme.colors.text.white}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ligand</Text>
          </View>
        </View>

        <View style={styles.errorContainer}>
          <MCIcons name="alert-circle-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Failed to load molecule</Text>
          <Text style={styles.errorText}>{cifError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => NavigationService.goBack()}
          >
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#667eea"
          colors={["#667eea"]}
        />
      }
    >
      {/* Header with back button and share button */}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <View style={styles.leftGroup}>
          <TouchableOpacity
            onPress={() => NavigationService.goBack()}
            style={styles.backButton}
          >
            <MCIcons
              name="arrow-left"
              size={22}
              color={theme.colors.text.white}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ligand</Text>
          {refreshing && (
            <ActivityIndicator
              size="small"
              color="#667eea"
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={[
              styles.favoriteButton,
              (!isFavorite(id) && !canAddFavorite()) || favoriteLoading ? styles.favoriteButtonDisabled : null
            ]}
            accessibilityLabel={
              favoriteLoading
                ? "Updating favorites..."
                : isFavorite(id)
                  ? "Remove from favorites"
                  : canAddFavorite()
                    ? "Add to favorites"
                    : `Favorites limit reached (${getFavoritesCount()}/${getMaxFavorites()})`
            }
            disabled={(!isFavorite(id) && !canAddFavorite()) || favoriteLoading}
          >
            {favoriteLoading ? (
              <ActivityIndicator size="small" color={theme.colors.text.white} />
            ) : (
              <MCIcons
                name={isFavorite(id) ? "heart" : "heart-outline"}
                size={20}
                color={
                  isFavorite(id)
                    ? "#FF3B30"
                    : canAddFavorite()
                      ? theme.colors.text.white
                      : theme.colors.text.whiteLight
                }
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.shareButton}
            accessibilityLabel="Share ligand"
          >
            <MCIcons
              name="share-variant"
              size={20}
              color={theme.colors.text.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{ padding: theme.spacing.xl, paddingVertical: theme.spacing.sm }}
      >
        <Text style={styles.title}>{id}</Text>
        <Text style={styles.subtitle}>{data?.name || "N/A"}</Text>
        {data && (
          <Text style={styles.stats}>
            {data.atoms?.length || 0} atoms, {data.bonds?.length || 0} bonds
          </Text>
        )}
      </View>

      {/* Tabs: 2D and 3D */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "3D" && styles.tabActive]}
          onPress={() => setActiveTab("3D")}
        >
          <MCIcons
            name="cube-outline"
            size={18}
            color={
              activeTab === "3D" ? "#4A90E2" : theme.colors.text.whiteLight
            }
          />
          <Text
            style={[styles.tabText, activeTab === "3D" && styles.tabTextActive]}
          >
            3D View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "2D" && styles.tabActive]}
          onPress={() => setActiveTab("2D")}
        >
          <MCIcons
            name="molecule"
            size={18}
            color={
              activeTab === "2D" ? "#4A90E2" : theme.colors.text.whiteLight
            }
          />
          <Text
            style={[styles.tabText, activeTab === "2D" && styles.tabTextActive]}
          >
            2D Details
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab content */}
      {activeTab === "3D" ? (
        <View style={styles.viewerContainer}>
          {data?.atoms && data.atoms.length > 0 ? (
            <Molecule3DViewer data={data} />
          ) : (
            <View style={styles.noDataContainer}>
              <MCIcons
                name="molecule"
                size={64}
                color={theme.colors.text.whiteLight}
              />
              <Text style={styles.noDataText}>
                {!data
                  ? "Loading..."
                  : !data.atoms
                    ? "No atom data"
                    : data.atoms.length === 0
                      ? "No atoms found"
                      : "No 3D structure available"}
              </Text>
              {data?.atoms && data.atoms.length > 0 && (
                <Text
                  style={[styles.noDataText, { fontSize: 12, marginTop: 8 }]}
                >
                  Debug: {data.atoms.length} atoms, {data.bonds?.length || 0}{" "}
                  bonds
                </Text>
              )}
            </View>
          )}
        </View>
      ) : (
        <MoleculeInfo
          data={data}
          svgXml={svgXml}
          svgLoading={svgLoading}
          svgError={svgError || null}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.medium,
    backgroundColor: theme.colors.background.primary,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  favoriteButton: {
    padding: theme.spacing.sm,
  },
  favoriteButtonDisabled: {
    opacity: 0.5,
  },
  shareButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    color: theme.colors.text.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  title: {
    color: theme.colors.text.white,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.text.whiteLight,
    fontSize: theme.typography.fontSize.base,
    marginBottom: theme.spacing.xs,
  },
  stats: {
    color: "#667eea",
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.text.white,
    fontSize: theme.typography.fontSize.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  errorTitle: {
    color: theme.colors.text.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  errorText: {
    color: theme.colors.text.whiteLight,
    fontSize: theme.typography.fontSize.sm,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    marginTop: theme.spacing.md,
  },
  retryText: {
    color: theme.colors.text.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.xl,
    // paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.medium,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#4A90E2",
  },
  tabText: {
    color: theme.colors.text.whiteLight,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
  tabTextActive: {
    color: "#4A90E2",
  },
  viewerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderBottomRightRadius: theme.borderRadius.md,
    borderBottomLeftRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  noDataContainer: {
    height: 400,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  noDataText: {
    color: theme.colors.text.whiteLight,
    fontSize: theme.typography.fontSize.base,
  },
});
