"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AUTH_COOKIE, AUTH_STORAGE_KEY, AUTH_TOKEN_KEY, normalizeAuthUser } from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/api";
import { authService } from "@/services/auth/service";
import type { AuthUser, LoginDTO } from "@/types/auth.type";

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginDTO) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function subscribe() {
  return () => undefined;
}

function getInitialUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (storedUser) {
    return JSON.parse(storedUser) as AuthUser;
  }

  return null;
}

function persistAuth(user: AuthUser | null, token?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (user) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    if (token) {
      window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    document.cookie = `${AUTH_COOKIE}=authenticated; path=/; max-age=86400; samesite=lax`;
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);
  const isReady = useSyncExternalStore(subscribe, () => true, () => false);

  useEffect(() => {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token || user) {
      return;
    }

    void (async () => {
      try {
        const response = await authService.me();
        const normalizedUser = normalizeAuthUser(response.data);
        setUser(normalizedUser);
        persistAuth(normalizedUser, token);
      } catch {
        persistAuth(null);
      }
    })();
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      isAuthenticated: Boolean(user),
      async login(payload) {
        try {
          const response = await authService.login({
            ...payload,
            device_name: payload.device_name ?? "sisac-web",
          });
          const normalizedUser = normalizeAuthUser(response.data.user);
          setUser(normalizedUser);
          persistAuth(normalizedUser, response.data.access_token);
          toast.success(response.message);
          router.push("/dashboard");
        } catch (error) {
          toast.error(getApiErrorMessage(error));
          throw error;
        }
      },
      async logout() {
        try {
          await authService.logout();
        } catch {
          // continua limpando a sessao local mesmo se a API falhar
        } finally {
          setUser(null);
          persistAuth(null);
          window.localStorage.removeItem("sisac.active-subunit");
          toast.success("Sessao encerrada.");
          router.push("/login");
        }
      },
      async refreshUser() {
        const response = await authService.me();
        const normalizedUser = normalizeAuthUser(response.data);
        setUser(normalizedUser);
        persistAuth(normalizedUser, window.localStorage.getItem(AUTH_TOKEN_KEY));
      },
      setUser(nextUser) {
        setUser(nextUser);
        persistAuth(nextUser, window.localStorage.getItem(AUTH_TOKEN_KEY));
      },
    }),
    [isReady, router, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
