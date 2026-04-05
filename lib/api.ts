import axios from "axios";
import type { AxiosError } from "axios";

import { AUTH_TOKEN_KEY } from "@/lib/auth";

type SubunitResolver = () => string | null;

let resolveActiveSubunit: SubunitResolver = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("sisac.active-subunit");
};

declare module "axios" {
  export interface AxiosRequestConfig {
    skipSubunit?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    skipSubunit?: boolean;
  }
}

export function setActiveSubunitResolver(resolver: SubunitResolver) {
  resolveActiveSubunit = resolver;
}

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api").replace(/\/+$/, "");

export const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  if (config.skipSubunit) {
    return config;
  }

  const activeSubunit = resolveActiveSubunit();

  if (!activeSubunit) {
    return Promise.reject(
      new Error("Nenhuma subunidade ativa selecionada. Selecione uma subunidade antes de continuar."),
    );
  }

  config.headers.set("X-Active-Subunit", activeSubunit);

  return config;
});

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;

    const firstValidationError = responseData?.errors
      ? Object.values(responseData.errors)[0]?.[0]
      : undefined;

    return firstValidationError ?? responseData?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu um erro inesperado.";
}

export type ApiError = AxiosError<{
  message?: string;
  errors?: Record<string, string[]>;
}>;
