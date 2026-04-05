"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/contexts/auth-context";
import { setActiveSubunitResolver } from "@/lib/api";
import type { Subunit } from "@/types/subunit.type";

interface SubunitContextValue {
  activeSubunit: Subunit | null;
  subunits: Subunit[];
  setActiveSubunit: (subunitId: string) => void;
}

const STORAGE_KEY = "sisac.active-subunit";
const SubunitContext = createContext<SubunitContextValue | undefined>(undefined);

export function SubunitProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const subunits = useMemo(() => user?.subunits ?? [], [user?.subunits]);
  const [activeSubunitId, setActiveSubunitId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(STORAGE_KEY);
  });

  const activeSubunit = useMemo<Subunit | null>(() => {
    if (!subunits.length) {
      return null;
    }

    return subunits.find((subunit) => subunit.id === activeSubunitId) ?? subunits[0];
  }, [activeSubunitId, subunits]);

  useEffect(() => {
    setActiveSubunitResolver(() => window.localStorage.getItem(STORAGE_KEY));
  }, []);

  useEffect(() => {
    if (activeSubunit) {
      window.localStorage.setItem(STORAGE_KEY, activeSubunit.id);
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }, [activeSubunit]);

  const value = useMemo<SubunitContextValue>(
    () => ({
      activeSubunit,
      subunits,
      setActiveSubunit(subunitId) {
        const nextSubunit = subunits.find((item) => item.id === subunitId);

        if (!nextSubunit) {
          toast.error("Subunidade invalida.");
          return;
        }

        setActiveSubunitId(nextSubunit.id);
        queryClient.invalidateQueries();
        toast.success(`Contexto alterado para ${nextSubunit.name}.`);
      },
    }),
    [activeSubunit, queryClient, subunits],
  );

  return <SubunitContext.Provider value={value}>{children}</SubunitContext.Provider>;
}

export function useSubunit() {
  const context = useContext(SubunitContext);

  if (!context) {
    throw new Error("useSubunit deve ser usado dentro de SubunitProvider.");
  }

  return context;
}
