import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function ProteinListScreen() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Protein List</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Protein list will be implemented here
        </Text>
        <Text style={styles.info}>
          This screen will display ligands from ligands.txt with search
          functionality
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  placeholder: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
