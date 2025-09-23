import React, { useState } from "react";
import Header from "@/components/HomeHeader";
import { Alert, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
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
import { AuthGuard } from "@/hooks/useAuth";

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
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <AuthGuard>
      <TabsContext.Provider value={{ activeTab, setActiveTab }}>
        <View style={styles.container}>
          <View style={styles.content}>{tabComponents[activeTab]}</View>
          <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </View>
      </TabsContext.Provider>
    </AuthGuard>
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
