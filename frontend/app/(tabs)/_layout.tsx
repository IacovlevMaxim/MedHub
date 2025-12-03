import React, { useState, useEffect } from "react";
import { Alert, View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAppDispatch } from "@/hooks/useRedux";

import { useAppSelector } from "@/hooks/useRedux";
import { 
  initializeAuthAsync, 
  refreshAccessTokenAsync, 
  selectIsAuthenticated,
  fetchUserRolesAsync,
  selectUserRoles 
} from "@/features/auth/authSlice";
import { BottomNavigation } from "../navigation-bar";
import { TabsContext } from "./tabContext";

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

const tabComponents: Record<string, React.ReactNode> = {
  dashboard: <PatientDashboard />,
  history: <MedicalHistory />,
  results: <LabResults />,
  appointments: <Appointments />,
  profile: <Profile />, // not shown in bottom nav but available for header navigation
  chat: <ChatBot />,
  faq: <FAQ />,
};

export default function TabLayout() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("dashboard");
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userRoles = useAppSelector(selectUserRoles);

  useEffect(() => {
    const checkStoredTokens = async () => {
      try {
        const resultAction = await dispatch(initializeAuthAsync());
        if (initializeAuthAsync.fulfilled.match(resultAction)) {
          // Fetch user roles after successful initialization
          await dispatch(fetchUserRolesAsync());
          return;
        }

        const resultRefresh = await dispatch(refreshAccessTokenAsync());
        if (refreshAccessTokenAsync.fulfilled.match(resultRefresh)) {
          // Fetch user roles after successful token refresh
          await dispatch(fetchUserRolesAsync());
          return;
        }

        router.replace("/login");
      } catch (error) {
        console.log("No tokens found, user needs to log in");
        router.replace("/login");
      }
    };

    checkStoredTokens();
  }, [dispatch, router, activeTab]);

  if(!isAuthenticated) {
      return (
        <View style={styles.container}>
          <Text style={{textAlign: 'center', marginTop: 50}}>Trying to login...</Text>
        </View>
      );
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <View style={styles.container}>
        <View style={styles.content}>{tabComponents[activeTab]}</View>
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          userRoles={userRoles}
        />
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
});
