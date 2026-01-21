import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useAppSelector } from "@/hooks/useRedux";
import { selectUserRoles } from "@/features/auth/authSlice";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface Tab {
  id: string;
  label: string;
  icon: string;
  allowedRoles: string[];
}

const tabs: Tab[] = [
  // Patient tabs
  { id: "dashboard", label: "Home", icon: "home", allowedRoles: ["patient", "doctor"] },
  { id: "results", label: "Results", icon: "activity", allowedRoles: ["patient"] },
  { id: "chat", label: "Chatbot", icon: "message-circle", allowedRoles: ["patient"] },
  // Doctor tabs
  { id: "history", label: "History", icon: "file-text", allowedRoles: ["patient", "doctor"] },
  { id: "appointments", label: "Appointments", icon: "calendar", allowedRoles: ["doctor"] },
];

export function BottomNavigation({
  activeTab,
  onTabChange,
}: BottomNavigationProps) {
  const userRoles = useAppSelector(selectUserRoles);
  const normalizedRoles = userRoles.length === 0 ? ["patient"] : userRoles.map(r => r.toLowerCase());

  // Filter tabs based on user roles
  const visibleTabs = tabs.filter(tab =>
    tab.allowedRoles.some(role => normalizedRoles.includes(role.toLowerCase()))
  );

  return (
    <View style={styles.navContainer}>
      <View style={styles.navRow}>
        {visibleTabs.map(({ id, label, icon }) => (
          <TouchableOpacity
            key={id}
            onPress={() => onTabChange(id)}
            style={[
              styles.tabButton,
              activeTab === id ? styles.tabActive : styles.tabInactive,
            ]}
          >
            <Feather
              name={icon}
              size={20}
              color={activeTab === id ? "#4F8EF7" : "#888"}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === id
                  ? styles.tabLabelActive
                  : styles.tabLabelInactive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    //sition: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e3e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    width: "100%",
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    paddingVertical: 4,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  tabActive: {
    backgroundColor: "#e8f0fe",
  },
  tabInactive: {
    backgroundColor: "#fff",
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 1,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: "#4F8EF7",
  },
  tabLabelInactive: {
    color: "#888",
  },
});
