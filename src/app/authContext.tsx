"use client";
import { createContext, useState } from 'react';
export const AuthContext = createContext<{isAuthenticated: boolean, setAuthenticated:React.Dispatch<React.SetStateAction<boolean>>}|undefined>(undefined);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}