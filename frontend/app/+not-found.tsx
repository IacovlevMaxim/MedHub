import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#b3261e',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    fontSize: 18,
    fontWeight: '600',
    textDecorationLine: "underline",
    color: Colors.light.tint,
  },
});

export default function NotFoundPage() {
  return (
    <>
      <Stack.Screen options={{ title: "Page Not Found" }} />
      <View style={styles.container}>
        <View style={styles.errorBox}>
          <Text style={styles.title}>404</Text>
          <Text style={styles.subtitle}>Page Not Found</Text>
          <Text style={styles.message}>
            The page you are looking for doesn't exist or has been moved.
          </Text>
          <Link style={styles.button} href="/">
            Go to Home
          </Link>
        </View>
      </View>
    </>
  );
}
