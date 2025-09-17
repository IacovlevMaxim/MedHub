import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatBot() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      role: "assistant",
      content: "Hi, I'm MedBot. How can I help you today?",
    },
  ]);
  const [draft, setDraft] = useState("");

  const historyItems = useMemo(
    () => [
      { id: "h1", title: "Chest pain advice" },
      { id: "h2", title: "Lab results summary" },
      { id: "h3", title: "Medication schedule" },
    ],
    []
  );

  // Drawer animation state
  const drawerX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const animateOpen = () => {
    setHistoryOpen(true);
    Animated.parallel([
      Animated.timing(drawerX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const animateClose = () => {
    Animated.parallel([
      Animated.timing(drawerX, {
        toValue: -SIDEBAR_WIDTH,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => setHistoryOpen(false));
  };

  // Edge swipe from left to open
  const edgePan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => g.moveX < 20 && g.dx > 8,
      onPanResponderMove: (_e, g) => {
        const dx = Math.max(0, g.dx);
        const x = Math.min(0, -SIDEBAR_WIDTH + dx);
        drawerX.setValue(x);
        const progress = 1 - Math.abs(x) / SIDEBAR_WIDTH;
        backdropOpacity.setValue(progress);
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dx > SIDEBAR_WIDTH / 3) animateOpen();
        else animateClose();
      },
    })
  ).current;

  // Swipe drawer left to close
  const drawerPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_e, g) => {
        const x = Math.min(0, Math.max(-SIDEBAR_WIDTH, g.dx));
        drawerX.setValue(x);
        const progress = 1 - Math.abs(x) / SIDEBAR_WIDTH;
        backdropOpacity.setValue(progress);
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dx < -SIDEBAR_WIDTH / 3) animateClose();
        else animateOpen();
      },
    })
  ).current;

  const onSend = () => {
    if (!draft.trim()) return;
    const newUserMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: draft.trim(),
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setDraft("");
    // Placeholder assistant echo for UI demo
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "Thanks! I'll get back to you shortly.",
        },
      ]);
    }, 400);
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.historyToggle}
          onPress={() => (historyOpen ? animateClose() : animateOpen())}
          activeOpacity={0.7}
        >
          <Feather
            name={historyOpen ? "chevron-left" : "menu"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MedBot</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.body} {...edgePan.panHandlers}>
        {/* Chat area */}
        <View style={styles.chatArea}>
          <FlatList
            contentContainerStyle={{ padding: 12 }}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.message,
                  item.role === "user" ? styles.userMsg : styles.assistantMsg,
                ]}
              >
                <Text style={styles.messageText}>{item.content}</Text>
              </View>
            )}
          />

          {/* Input bar */}
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Feather name="paperclip" size={20} color="#4F8EF7" />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Send a message"
              placeholderTextColor="#888"
              value={draft}
              onChangeText={setDraft}
            />
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={onSend}
              activeOpacity={0.7}
            >
              <Feather name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Slide-over history panel and backdrop (animated) */}
        <Animated.View
          pointerEvents={historyOpen ? "auto" : "none"}
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={animateClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sidebarOverlay,
            { transform: [{ translateX: drawerX }] },
          ]}
          {...drawerPan.panHandlers}
        >
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>History</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Feather name="plus" size={18} color="#4F8EF7" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={historyItems}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.historyItem} activeOpacity={0.7}>
                <Feather name="message-circle" size={16} color="#4F8EF7" />
                <Text style={styles.historyText} numberOfLines={1}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const SIDEBAR_WIDTH = 240;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FA" },
  header: {
    height: 52,
    backgroundColor: "#4F8EF7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  historyToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  body: { flex: 1 },
  sidebarHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e3e8f0",
  },
  sidebarTitle: { fontSize: 14, color: "#222", fontWeight: "600" },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  historyText: { color: "#222", marginLeft: 8, flex: 1 },

  chatArea: { flex: 1 },
  message: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: Dimensions.get("window").width * 0.8,
  },
  userMsg: { alignSelf: "flex-end", backgroundColor: "#dbeafe" },
  assistantMsg: { alignSelf: "flex-start", backgroundColor: "#fff" },
  messageText: { color: "#222" },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e3e8f0",
    backgroundColor: "#fff",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2ff",
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#e3e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F5F6FA",
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#4F8EF7",
    height: 40,
    minWidth: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  // Overlay styles for mobile history (full height)
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 20,
  },
  sidebarOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e3e8f0",
    zIndex: 30,
  },
});
