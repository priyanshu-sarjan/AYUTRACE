import { useState, useEffect, useCallback } from "react";
import type { User } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(
    localStorage.getItem("ayutrace_token")
  );
  const [user, setUserState] = useState<User | null>(() => {
    const stored = localStorage.getItem("ayutrace_user");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setAuth = useCallback(
    (newToken: string, newUser: User) => {
      localStorage.setItem("ayutrace_token", newToken);
      localStorage.setItem("ayutrace_user", JSON.stringify(newUser));
      setTokenState(newToken);
      setUserState(newUser);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("ayutrace_token");
    localStorage.removeItem("ayutrace_user");
    setTokenState(null);
    setUserState(null);
    queryClient.clear();
  }, [queryClient]);

  return {
    token,
    user,
    setAuth,
    logout,
    isAuthenticated: !!token && !!user,
  };
}
