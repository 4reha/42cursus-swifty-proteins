import React from "react";
import { View } from "react-native";
import { globalStyles } from "../../styles/globalStyles";
import { CardProps } from "@/types/component.types";

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
