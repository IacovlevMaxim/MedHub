import React, { createContext, useContext, useState, ReactNode } from "react";

interface TempCredentialsContextType {
  identifier: string;
  password: string;
  setCredentials: (identifier: string, password: string) => void;
  clearCredentials: () => void;
}

const TempCredentialsContext = createContext<
  TempCredentialsContextType | undefined
>(undefined);

export function TempCredentialsProvider({ children }: { children: ReactNode }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const setCredentials = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
  };

  const clearCredentials = () => {
    setIdentifier("");
    setPassword("");
  };

  return (
    <TempCredentialsContext.Provider
      value={{ identifier, password, setCredentials, clearCredentials }}
    >
      {children}
    </TempCredentialsContext.Provider>
  );
}

export function useTempCredentials() {
  const context = useContext(TempCredentialsContext);
  if (context === undefined) {
    throw new Error(
      "useTempCredentials must be used within a TempCredentialsProvider"
    );
  }
  return context;
}
