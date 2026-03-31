import { createContext, useContext, useEffect, useState } from "react";

import { loginRequest, setAuthToken } from "../api/client";

const STORAGE_KEY = "acms-admin-session";
const AuthContext = createContext(null);

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthToken(session?.token || null);
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return;
    }
    window.localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  async function login(email, password) {
    setLoading(true);
    try {
      const response = await loginRequest({ email, password });
      const nextSession = {
        token: response.access_token,
        admin: response.admin,
        expiresIn: response.expires_in
      };
      setSession(nextSession);
      return response;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setSession(null);
  }

  const value = {
    session,
    admin: session?.admin || null,
    token: session?.token || null,
    isAuthenticated: Boolean(session?.token),
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
