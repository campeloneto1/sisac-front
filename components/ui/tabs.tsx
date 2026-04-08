"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs components must be used within <Tabs />.");
  }

  return context;
}

export function Tabs({
  value,
  onValueChange,
  children,
  className,
}: React.PropsWithChildren<{
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}>) {
  return (
    <TabsContext.Provider value={{ value, setValue: onValueChange }}>
      <div className={cn("space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "inline-flex w-full flex-wrap gap-2 rounded-[24px] border border-slate-200/70 bg-white/80 p-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  className,
  children,
}: React.PropsWithChildren<{ value: string; className?: string }>) {
  const { value: currentValue, setValue } = useTabsContext();
  const isActive = currentValue === value;

  return (
    <button
      type="button"
      onClick={() => setValue(value)}
      className={cn(
        "rounded-2xl px-4 py-2.5 text-sm transition",
        isActive
          ? "bg-slate-950 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: React.PropsWithChildren<{ value: string; className?: string }>) {
  const { value: currentValue } = useTabsContext();

  if (currentValue !== value) {
    return null;
  }

  return <div className={className}>{children}</div>;
}
