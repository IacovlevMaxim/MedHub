import React, { useState, useEffect } from "react";
import { Alert, View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAppDispatch } from "@/hooks/useRedux";

import { useAppSelector } from "@/hooks/useRedux";
import { initializeAuthAsync, refreshAccessTokenAsync, selectIsAuthenticated, selectUserRoles } from "@/features/auth/authSlice";
import { BottomNavigation } from "../navigation-bar";
import { TabsContext } from "./tabContext";
import { RoleGuard } from "@/components/RoleGuard";

// Import your tab screens
import PatientDashboard from "./index";
import MedicalHistory from "./medical-history";
import LabResults from "./lab-results";
import Appointments from "./appointments";
import Profile from "./profile";
import ChatBot from "./chatbot";
import FAQ from "./faq";
// import { AuthGuard } from "@/hooks/useAuth";

const handleSearchPress = () => {
  Alert.alert("Search", "Search functionality coming soon!");
};

const handleNotificationPress = () => {
  Alert.alert("Notifications", "Notification functionality coming soon!");
};

// Define tab configuration with roles
interface TabConfig {
  id: string;
  component: React.ReactNode;
  allowedRoles: string[];
  label?: string; // Optional label for bottom navigation
}

const tabConfigs: TabConfig[] = [
  // Common tabs
  {
    id: 'dashboard',
    component: <PatientDashboard />,
    allowedRoles: ['patient', 'doctor'],
    label: 'Home',
  },
  // Patient-only tabs
  {
    id: 'results',
    component: <LabResults />,
    allowedRoles: ['patient'],
    label: 'Results',
  },
  {
    id: 'chat',
    component: <ChatBot />,
    allowedRoles: ['patient'],
    label: 'Chatbot',
  },
  // Doctor-only tabs
  {
    id: 'history',
    component: <MedicalHistory />,
    allowedRoles: ['doctor'],
    label: 'History',
  },
  {
    id: 'appointments',
    component: <Appointments />,
    allowedRoles: ['doctor'],
    label: 'Appointments',
  },
  // Additional tabs (not in bottom nav)
  {
    id: 'profile',
    component: <Profile />,
    allowedRoles: ['patient', 'doctor'],
  },
  {
    id: 'faq',
    component: <FAQ />,
    allowedRoles: ['patient', 'doctor'],
  },
];

const tabComponents: Record<string, { component: React.ReactNode; allowedRoles: string[] }> = {};
tabConfigs.forEach(config => {
  tabComponents[config.id] = {
    component: config.component,
    allowedRoles: config.allowedRoles,
  };
});

export default function TabLayout() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("dashboard");
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userRoles = useAppSelector(selectUserRoles);

  // Get first accessible tab for the user
  const getDefaultTab = () => {
    const normalizedRoles = userRoles.map(r => r.toLowerCase());
    const accessibleTab = tabConfigs.find(tab => 
      tab.label && tab.allowedRoles.some(role => normalizedRoles.includes(role.toLowerCase()))
    );
    return accessibleTab?.id || 'dashboard';
  };

  useEffect(() => {
    const checkStoredTokens = async () => {
      try {
        const resultAction = await dispatch(initializeAuthAsync());
        if (initializeAuthAsync.fulfilled.match(resultAction)) return;

        const resultRefresh = await dispatch(refreshAccessTokenAsync());
        if (refreshAccessTokenAsync.fulfilled.match(resultRefresh)) return;

        router.replace("/login");
      } catch (error) {
        console.log("No tokens found, user needs to log in");
        router.replace("/login");
      }
    };

    checkStoredTokens();
  }, [dispatch, router]);

  // Set default tab based on user role when roles are loaded
  useEffect(() => {
    if (userRoles.length > 0 && activeTab === 'dashboard') {
      const defaultTab = getDefaultTab();
      if (defaultTab !== activeTab) {
        setActiveTab(defaultTab);
      }
    }
  }, [userRoles]);

  if(!isAuthenticated) {
      return (
        <View style={styles.container}>
          <Text style={{textAlign: 'center', marginTop: 50}}>Trying to login...</Text>
        </View>
      );
  }

  const currentTabConfig = tabComponents[activeTab];
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <View style={styles.container}>
        <View style={styles.content}>
          {currentTabConfig ? (
            <RoleGuard allowedRoles={currentTabConfig.allowedRoles}>
              {currentTabConfig.component}
            </RoleGuard>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Tab not found</Text>
            </View>
          )}
        </View>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    </TabsContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
  },
  errorText: {
    fontSize: 18,
    color: '#222',
  },
});
