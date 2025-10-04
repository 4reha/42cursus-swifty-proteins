import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import { LIGANDS } from "../config/ligands";
import { GradientHeader, SearchBar } from "../components/ui";
import LigandListItem from "../components/protein/LigandListItem";
import globalStyles from "../styles/globalStyles";
import { theme } from "../styles/theme";

interface LigandItem {
  id: string;
  name?: string;
  isLoading?: boolean;
  error?: string;
}

interface ProteinListScreenProps {
  onLigandSelect: (ligandId: string) => void;
}

export default function ProteinListScreen({
  onLigandSelect,
}: Readonly<ProteinListScreenProps>) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Filter ligands based on search query
  const filteredLigands = useMemo(() => {
    if (!searchQuery.trim()) {
      return LIGANDS;
    }
    return LIGANDS.filter((ligand) =>
      ligand.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleLigandPress = (ligandId: string) => {
    console.log(`🔄 Navigating to ligand: ${ligandId}`);
    onLigandSelect(ligandId);
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 200); // Show button after scrolling down 200px
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderLigandItem = ({ item }: { item: string }) => (
    <LigandListItem ligandId={item} onPress={handleLigandPress} />
  );

  const renderHeader = () => (
    <View
      style={{
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
      }}
    >
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery("")}
        placeholder="Search ligands..."
      />
      <Text style={globalStyles.captionText}>
        {searchQuery
          ? `${filteredLigands.length} results for "${searchQuery}"`
          : `${LIGANDS.length} ligands available`}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={globalStyles.emptyState}>
      <MCIcons
        name="flask-empty-outline"
        size={64}
        color={theme.colors.text.muted}
      />
      <Text style={globalStyles.emptyStateTitle}>No ligands found</Text>
      <Text style={globalStyles.emptyStateSubtitle}>
        Try adjusting your search term
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <GradientHeader
        title="Protein Visualizer"
        subtitle={`Welcome, ${user?.name || user?.login || "User"}`}
        rightComponent={
          <TouchableOpacity style={globalStyles.profileButton} onPress={logout}>
            <MCIcons name="logout" size={28} color={theme.colors.text.white} />
          </TouchableOpacity>
        }
      />

      {renderHeader()}

      <FlatList
        ref={flatListRef}
        data={filteredLigands}
        keyExtractor={(item) => item}
        renderItem={renderLigandItem}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: theme.spacing.xl }}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <View style={styles.scrollToTopButton}>
          <TouchableOpacity
            style={styles.scrollButton}
            onPress={scrollToTop}
            activeOpacity={0.8}
          >
            <MCIcons
              name="arrow-up"
              size={24}
              color={theme.colors.text.white}
            />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollToTopButton: {
    position: "absolute",
    bottom: theme.spacing["2xl"],
    right: theme.spacing.xl,
    elevation: 8,
    shadowColor: theme.colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  scrollButton: {
    backgroundColor: theme.colors.primary.light,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});
