import { usePathname } from "expo-router";
import { Stack } from "expo-router";
import React from "react";
import { Alert, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Provider } from "react-redux";
import Header from "@/components/HomeHeader";
import { store } from "./store";
import { FontAwesome } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
import HomeScreen from "./(tabs)/index";
import ProfileScreen from "./(tabs)/profile";
import FAQScreen from "./(tabs)/faq";
import MedicalHistoryView from "./(tabs)/medical-history";
import LabResultsView from "./(tabs)/lab-results";
import AppointmentsView from "./(tabs)/appointments";
import AlertComponent from "@/components/AlertComponent";
import { AppointmentsProvider } from "@/contexts/AppointmentsContext";
import { TempCredentialsProvider } from "@/contexts/TempCredentialsContext";

const handleSearchPress = () => {
  Alert.alert("Search", "Search functionality coming soon!");
};

const handleNotificationPress = () => {
  Alert.alert("Notifications", "Notification functionality coming soon!");
};

// function Footer() {
//   const socialIcons = [
//     {
//       name: "facebook",
//       url: "https://www.facebook.com/cristian.lupasco.5/?locale=ru_RU}",
//     },
//     {
//       name: "youtube-play",
//       url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1",
//     },
//     { name: "instagram", url: "https://www.instagram.com/cristi_2480/" },
//   ];

const handlePress = (url: string) => {
  if (Platform.OS === "web") {
    window.open(url, "_blank");
  } else {
    Linking.openURL(url);
  }
};
//  return (
// <View style={styles.footer}>
//     <View style={styles.socialRow}>
//       {socialIcons.map((icon, idx) => (
//         <TouchableOpacity
//           key={icon.name}
//           onPress={() => handlePress(icon.url)}
//           style={styles.iconButton}
//         >
//           <FontAwesome name={icon.name as any} size={22} color="#888" />
//         </TouchableOpacity>
//       ))}
//       {/* </View> */}
//       <Text style={styles.footerText}>© 2025 MedHub</Text>
//     </View>
//   );
// }

export default function RootLayout() {
  const pathname = usePathname();

  // Check if current route is in (tabs)
  const isTabs = pathname.startsWith("/(tabs)");

  // Render the correct tab page
  let TabContent = null;
  if (pathname === "/(tabs)/home") TabContent = <HomeScreen />;
  else if (pathname === "/(tabs)/profile") TabContent = <ProfileScreen />;
  else if (pathname === "/(tabs)/medical-history")
    TabContent = <MedicalHistoryView />;
  else if (pathname === "/(tabs)/lab-results") TabContent = <LabResultsView />;
  else if (pathname === "/(tabs)/faq") TabContent = <FAQScreen />;
  else if (pathname === "/(tabs)/appointments")
    TabContent = <AppointmentsView />;

  return (
    <Provider store={store}>
      <TempCredentialsProvider>
        <AppointmentsProvider>
          <View style={styles.container}>
            {/* Global alert listener */}
            <AlertComponent />
            {isTabs ? (
              <Header
                userName="Mr. Williamson"
                onSearchPress={handleSearchPress}
                onNotificationPress={handleNotificationPress}
              />
            ) : (
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
                <Stack.Screen name="reset" />
                <Stack.Screen name="reset-password" />
                <Stack.Screen name="confirm-email" />
                <Stack.Screen name="book-appointment" />
                <Stack.Screen name="otp-verification" />
                <Stack.Screen name="change-password" />
              </Stack>
            )}
          </View>
        </AppointmentsProvider>
      </TempCredentialsProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000ff",
  },
  content: {
    flex: 1,
  },
  // footer: {
  //   height: 70,
  //   backgroundColor: "#ffffffff",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   paddingBottom: 8,
  // },
  socialRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  iconButton: {
    marginHorizontal: 8,
  },
  footerText: {
    color: "#000000ff",
    fontSize: 14,
  },
});
