"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { AuthUser, LoginDTO } from "@/types/auth.type";

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginDTO) => Promise<void>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = "sisac.auth-user";
const AUTH_COOKIE = "sisac_session";

const defaultUser: AuthUser = {
  id: 1,
  name: "Ana Martins",
  email: "ana@sisac.local",
  role: "Administrador",
  avatarFallback: "AM",
  permissions: {
    "*": ["*"],
    dashboard: ["viewAny", "view"],
  },
  subunits: [
    { id: "recife-centro", name: "Recife Centro", code: "REC-CEN" },
    { id: "olinda-norte", name: "Olinda Norte", code: "OLD-NOR" },
    { id: "jaboatao-sul", name: "Jaboatao Sul", code: "JAB-SUL" },
  ],
};

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

  if (document.cookie.includes(`${AUTH_COOKIE}=authenticated`)) {
    persistAuth(defaultUser);
    return defaultUser;
  }

  return null;
}

function persistAuth(user: AuthUser | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (user) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    document.cookie = `${AUTH_COOKIE}=authenticated; path=/; max-age=86400; samesite=lax`;
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);
  const isReady = useSyncExternalStore(subscribe, () => true, () => false);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      isAuthenticated: Boolean(user),
      async login(payload) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const nextUser: AuthUser = {
          ...defaultUser,
          email: payload.email,
          name: payload.email.split("@")[0].replace(".", " "),
          avatarFallback: payload.email.slice(0, 2).toUpperCase(),
        };

        setUser(nextUser);
        persistAuth(nextUser);
        toast.success("Login realizado com sucesso.");
        router.push("/dashboard");
      },
      logout() {
        setUser(null);
        persistAuth(null);
        window.localStorage.removeItem("sisac.active-subunit");
        toast.success("Sessao encerrada.");
        router.push("/login");
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
