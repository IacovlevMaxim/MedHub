import React, { createContext, useContext } from "react";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export const TabsContext = createContext<TabsContextType | undefined>(
  undefined
);

export function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("useTabs must be used within TabsContext.Provider");
  }
  return ctx;
}
