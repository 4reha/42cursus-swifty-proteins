import { useFavorites } from "@/contexts/FavoritesContext";
import { NavigationService } from "@/services/navigationService";
import { globalStyles } from "@/styles/globalStyles";
import { theme } from "@/styles/theme";
import { FavoriteProtein } from "@/types/ligand.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

export default function FavoritesScreen() {
  const { favorites, removeFromFavorites } = useFavorites();

  const renderFavoriteItem = ({ item }: { item: FavoriteProtein }) => (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.background.card,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.medium,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      onPress={() => NavigationService.toLigandDetail(item.id)}
    >
      <View style={{ flex: 1, marginRight: theme.spacing.md }}>
        <Text
          style={{
            color: theme.colors.text.white,
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.medium,
            marginBottom: 4,
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        <Text
          style={{
            color: theme.colors.text.whiteLight,
            fontSize: theme.typography.fontSize.sm,
          }}
        >
          {item.type}
        </Text>
        <Text
          style={{
            color: theme.colors.text.whiteLight,
            fontSize: theme.typography.fontSize.xs,
            marginTop: 4,
          }}
        >
          Last viewed: {item.lastViewed}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
          flexShrink: 0,
        }}
      >
        <Text
          style={{
            color: theme.colors.text.whiteLight,
            fontSize: theme.typography.fontSize.xs,
          }}
        >
          {item.atomCount} atoms
        </Text>
        <TouchableOpacity
          onPress={() => removeFromFavorites(item.id)}
          style={{
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.md,
            backgroundColor: "rgba(255, 59, 48, 0.1)",
          }}
        >
          <Ionicons name="heart-dislike" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.text.whiteLight}
      />
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      <View
        style={{
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.lg,
        }}
      >
        <Text
          style={{
            color: theme.colors.text.white,
            fontSize: theme.typography.fontSize["6xl"],
            fontWeight: theme.typography.fontWeight.bold,
            marginBottom: theme.spacing.sm,
          }}
        >
          Favorites
        </Text>
        <Text
          style={{
            color: theme.colors.text.whiteLight,
            fontSize: theme.typography.fontSize.base,
          }}
        >
          Your favorite proteins
        </Text>
      </View>

      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.xl,
            paddingBottom: theme.spacing.xl,
          }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: theme.spacing.xl,
          }}
        >
          <Ionicons
            name="heart-outline"
            size={64}
            color={theme.colors.text.whiteLight}
            style={{ marginBottom: theme.spacing.lg }}
          />
          <Text
            style={{
              color: theme.colors.text.white,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.medium,
              marginBottom: theme.spacing.sm,
              textAlign: "center",
            }}
          >
            No Favorites Yet
          </Text>
          <Text
            style={{
              color: theme.colors.text.whiteLight,
              fontSize: theme.typography.fontSize.base,
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            Start exploring proteins and add them to your favorites by tapping
            the heart icon
          </Text>
        </View>
      )}
    </View>
  );
}
