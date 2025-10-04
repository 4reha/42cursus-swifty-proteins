import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import MCIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "../../styles/theme";
import globalStyles from "../../styles/globalStyles";

interface SearchBarProps extends Omit<TextInputProps, "style"> {
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly onClear?: () => void;
  readonly placeholder?: string;
  readonly style?: StyleProp<ViewStyle>;
}

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search...",
  style,
  ...props
}: Readonly<SearchBarProps>) {
  return (
    <View style={[globalStyles.inputContainer, style]}>
      <MCIcons
        name="magnify"
        size={20}
        color={theme.colors.text.secondary}
        style={{ marginRight: theme.spacing.md }}
      />
      <TextInput
        style={globalStyles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.muted}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="characters"
        {...props}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          style={{ padding: theme.spacing.xs }}
        >
          <MCIcons
            name="close-circle"
            size={20}
            color={theme.colors.text.muted}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
