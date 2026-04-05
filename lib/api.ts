import axios from "axios";

type SubunitResolver = () => string | null;

let resolveActiveSubunit: SubunitResolver = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("sisac.active-subunit");
};

export function setActiveSubunitResolver(resolver: SubunitResolver) {
  resolveActiveSubunit = resolver;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const activeSubunit = resolveActiveSubunit();

  if (!activeSubunit) {
    return Promise.reject(
      new Error("Nenhuma subunidade ativa selecionada. Selecione uma subunidade antes de continuar."),
    );
  }

  config.headers.set("X-Active-Subunit", activeSubunit);

  return config;
});

