import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useAppSelector } from "@/hooks/useRedux";
import { selectAccessToken, selectUserRoles } from "@/features/auth/authSlice";
import { Colors } from "@/constants/Colors";
import Feather from "react-native-vector-icons/Feather";

interface XRayResult {
  success: boolean;
  numFiles: number;
  filenames: string[];
  reportText: string;
  overlays?: Array<{
    imageIndex: number;
    overlayPngBase64: string;
  }>;
  circles?: any[];
  boxes?: any[];
}

export default function XRayAnalysisView() {
  const accessToken = useAppSelector(selectAccessToken);
  const userRoles = useAppSelector(selectUserRoles);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<XRayResult | null>(null);

  // Check if user is a doctor
  const isDoctor = userRoles.includes("Doctor");

  if (!isDoctor) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDenied}>
          <Feather name="lock" size={64} color="#FF6B6B" />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            This feature is only available for doctors.
          </Text>
        </View>
      </View>
    );
  }

  const pickImages = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        setSelectedFiles(result.assets);
        setResult(null); // Clear previous results
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images");
    }
  };

  const analyzeXRay = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert("Error", "Please select at least one X-ray image");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();

      // For web, we need to convert the file to a Blob
      for (const file of selectedFiles) {
        // Fetch the file and convert to blob for web compatibility
        const response = await fetch(file.uri);
        const blob = await response.blob();

        // Create a proper File object for web
        const fileObj = new File([blob], file.name || "xray.jpg", {
          type: file.mimeType || "image/jpeg",
        });

        formData.append("files", fileObj);
      }

      const backendApi = process.env.EXPO_PUBLIC_API_URL || "";
      const apiResponse = await fetch(`${backendApi}/api/XRay/full-analysis`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Don't set Content-Type - let browser/fetch set it with boundary
        },
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse
          .json()
          .catch(() => ({ error: "Analysis failed" }));
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await apiResponse.json();
      setResult(data);
    } catch (error) {
      console.error("X-Ray analysis error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setResult(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Feather name="activity" size={32} color={Colors.light.tint} />
          <Text style={styles.headerTitle}>X-Ray Analysis</Text>
          <Text style={styles.headerSubtitle}>
            Upload X-ray images for AI-powered analysis
          </Text>
        </View>

        {/* Upload Section */}
        {!result && (
          <View style={styles.uploadSection}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImages}
              disabled={loading}
            >
              <Feather name="upload-cloud" size={32} color="#fff" />
              <Text style={styles.uploadButtonText}>
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} file(s) selected`
                  : "Select X-ray Images"}
              </Text>
            </TouchableOpacity>

            {selectedFiles.length > 0 && (
              <View style={styles.filesContainer}>
                {selectedFiles.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    <Feather name="file" size={20} color={Colors.light.tint} />
                    <Text style={styles.fileName}>{file.name}</Text>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearSelection}
                >
                  <Text style={styles.clearButtonText}>Clear Selection</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedFiles.length > 0 && !loading && (
              <TouchableOpacity
                style={styles.analyzeButton}
                onPress={analyzeXRay}
              >
                <Feather name="activity" size={20} color="#fff" />
                <Text style={styles.analyzeButtonText}>Analyze X-Ray</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.tint} />
            <Text style={styles.loadingText}>Analyzing X-ray images...</Text>
            <Text style={styles.loadingSubtext}>
              This may take a few moments
            </Text>
          </View>
        )}

        {/* Results Section */}
        {result && !loading && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Feather name="check-circle" size={32} color="#4CAF50" />
              <Text style={styles.resultsTitle}>Analysis Complete</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{result.numFiles}</Text>
                <Text style={styles.statLabel}>Images Analyzed</Text>
              </View>
            </View>

            {/* Report Text */}
            <View style={styles.reportSection}>
              <Text style={styles.sectionTitle}>
                <Feather name="file-text" size={20} color={Colors.light.tint} />{" "}
                Analysis Report
              </Text>
              <View style={styles.reportCard}>
                <ScrollView style={styles.reportScroll}>
                  <Text style={styles.reportText}>{result.reportText}</Text>
                </ScrollView>
              </View>
            </View>

            {/* Overlays */}
            {result.overlays && result.overlays.length > 0 && (
              <View style={styles.overlaysSection}>
                <Text style={styles.sectionTitle}>
                  <Feather name="image" size={20} color={Colors.light.tint} />{" "}
                  Annotated Images
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {result.overlays.map((overlay, index) => (
                    <View key={index} style={styles.overlayCard}>
                      <Image
                        source={{
                          uri: `data:image/png;base64,${overlay.overlayPngBase64}`,
                        }}
                        style={styles.overlayImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.overlayLabel}>
                        {result.filenames[overlay.imageIndex]}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* New Analysis Button */}
            <TouchableOpacity
              style={styles.newAnalysisButton}
              onPress={clearSelection}
            >
              <Feather name="plus-circle" size={20} color="#fff" />
              <Text style={styles.newAnalysisButtonText}>New Analysis</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#888",
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E3E8F0",
    borderStyle: "dashed",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  uploadButtonText: {
    color: "#4F8EF7",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  filesContainer: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  fileName: {
    marginLeft: 12,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  clearButton: {
    marginTop: 12,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#b3261e",
    fontSize: 14,
    fontWeight: "600",
  },
  analyzeButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  analyzeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 12,
  },
  statsRow: {
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.light.tint,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  reportSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 400,
  },
  reportScroll: {
    maxHeight: 360,
  },
  reportText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
  },
  overlaysSection: {
    marginBottom: 24,
  },
  overlayCard: {
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overlayImage: {
    width: 250,
    height: 250,
    borderRadius: 8,
  },
  overlayLabel: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  newAnalysisButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  newAnalysisButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  accessDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#b3261e",
    marginTop: 20,
  },
  accessDeniedText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
  },
});
