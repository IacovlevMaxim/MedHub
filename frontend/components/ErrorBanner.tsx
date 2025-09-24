import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fdecea",
    borderColor: "#f5c2c0",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  text: {
    color: "#b3261e",
    fontSize: 14,
    fontWeight: "500",
  },
});
