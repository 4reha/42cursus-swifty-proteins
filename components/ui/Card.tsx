import React from "react";
import { View, ViewProps, StyleProp, ViewStyle } from "react-native";
import globalStyles from "../../styles/globalStyles";

interface CardProps extends ViewProps {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export default function Card({
  children,
  style,
  ...props
}: Readonly<CardProps>) {
  return (
    <View style={[globalStyles.card, style]} {...props}>
      {children}
    </View>
  );
}
