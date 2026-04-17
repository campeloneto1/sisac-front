"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Loader2, FileText, Users, Car, Shield, Package, FileCheck, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { useGlobalSearch } from "@/hooks/use-global-search";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchResult } from "@/types/search.type";

const moduleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "file-text": FileText,
  "users": Users,
  "car": Car,
  "shield": Shield,
  "package": Package,
  "file-check": FileCheck,
};

function getStatusColor(status: string | null): string {
  if (!status) return "bg-slate-200 text-slate-700";

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    available: "bg-green-100 text-green-700",
    ativo: "bg-green-100 text-green-700",
    disponível: "bg-green-100 text-green-700",
    inactive: "bg-slate-200 text-slate-700",
    inativo: "bg-slate-200 text-slate-700",
    pending: "bg-yellow-100 text-yellow-700",
    pendente: "bg-yellow-100 text-yellow-700",
    in_use: "bg-blue-100 text-blue-700",
    "em uso": "bg-blue-100 text-blue-700",
    maintenance: "bg-orange-100 text-orange-700",
    manutenção: "bg-orange-100 text-orange-700",
  };

  return statusColors[status.toLowerCase()] || "bg-slate-200 text-slate-700";
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching } = useGlobalSearch({
    query: debouncedQuery,
  });

  // Debounce do input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Abrir dropdown quando tiver resultados
  useEffect(() => {
    if (data?.data.results && data.data.results.length > 0 && debouncedQuery.length >= 3) {
      setIsOpen(true);
    }
  }, [data, debouncedQuery]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
    router.push(result.url);
  };

  const handleClearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
  };

  // Agrupar resultados por módulo
  const groupedResults: Record<string, SearchResult[]> = {};
  if (data?.data.results) {
    data.data.results.forEach((result) => {
      if (!groupedResults[result.module_label]) {
        groupedResults[result.module_label] = [];
      }
      groupedResults[result.module_label].push(result);
    });
  }

  return (
    <div ref={wrapperRef} className="relative min-w-[220px] xl:min-w-[260px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        className="h-10 pl-9 pr-9"
        placeholder="Buscar módulos, pessoas ou processos"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (data?.data.results && data.data.results.length > 0 && debouncedQuery.length >= 3) {
            setIsOpen(true);
          }
        }}
      />
      {query && (
        <button
          type="button"
          onClick={handleClearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {(isLoading || isFetching) && debouncedQuery.length >= 3 && (
        <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
      )}

      {/* Resultados */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {isLoading && debouncedQuery.length >= 3 && (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && data?.data.results && data.data.results.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">
              Nenhum resultado encontrado para &quot;{debouncedQuery}&quot;
            </div>
          )}

          {!isLoading && data?.data.results && data.data.results.length > 0 && (
            <div className="p-2">
              <div className="mb-3 px-2 text-xs text-slate-500">
                {data.data.total} {data.data.total === 1 ? "resultado encontrado" : "resultados encontrados"}
              </div>

              {Object.entries(groupedResults).map(([moduleLabel, results]) => (
                <div key={moduleLabel} className="mb-4 last:mb-0">
                  <div className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                    {moduleLabel}
                  </div>
                  <div className="space-y-1">
                    {results.map((result) => {
                      const IconComponent = moduleIcons[result.icon] || FileText;

                      return (
                        <button
                          key={`${result.module}-${result.id}`}
                          type="button"
                          onClick={() => handleResultClick(result)}
                          className="w-full rounded-md px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                              <IconComponent className="h-4 w-4 text-slate-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="truncate text-sm font-medium text-slate-900">
                                  {result.title}
                                </p>
                                {result.status_label && (
                                  <Badge
                                    variant="secondary"
                                    className={`shrink-0 text-xs ${getStatusColor(result.status)}`}
                                  >
                                    {result.status_label}
                                  </Badge>
                                )}
                              </div>
                              {result.subtitle && (
                                <p className="mt-0.5 truncate text-xs text-slate-600">
                                  {result.subtitle}
                                </p>
                              )}
                              {result.description && (
                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                  {result.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
