"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AsyncSelectOption {
  value: string;
  label: string;
}

interface AsyncPageResult<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
  };
}

interface AsyncSearchableSelectProps<T> {
  value?: string;
  onValueChange: (value: string) => void;
  queryKey: readonly unknown[];
  loadPage: (params: { page: number; search: string }) => Promise<AsyncPageResult<T>>;
  mapOption: (item: T) => AsyncSelectOption;
  selectedOption?: AsyncSelectOption | null;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function AsyncSearchableSelect<T>({
  value,
  onValueChange,
  queryKey,
  loadPage,
  mapOption,
  selectedOption,
  placeholder = "Selecione uma opcao",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhuma opcao encontrada.",
  loadingMessage = "Carregando...",
  triggerClassName,
  disabled = false,
}: AsyncSearchableSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cachedSelectedOption, setCachedSelectedOption] = useState<AsyncSelectOption | null>(selectedOption ?? null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (!open) {
      return;
    }

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [open, debouncedSearch]);

  const query = useInfiniteQuery({
    queryKey: [...queryKey, debouncedSearch],
    queryFn: ({ pageParam }) => loadPage({ page: Number(pageParam), search: debouncedSearch }),
    initialPageParam: 1,
    getNextPageParam(lastPage) {
      if (lastPage.meta.current_page >= lastPage.meta.last_page) {
        return undefined;
      }

      return lastPage.meta.current_page + 1;
    },
    enabled: open && !disabled,
  });

  const options = useMemo(() => {
    const mapped = (query.data?.pages ?? []).flatMap((page) => page.data.map(mapOption));
    const deduped = new Map<string, AsyncSelectOption>();
    const resolvedSelectedOption = selectedOption ?? cachedSelectedOption;

    if (resolvedSelectedOption) {
      deduped.set(resolvedSelectedOption.value, resolvedSelectedOption);
    }

    mapped.forEach((option) => {
      deduped.set(option.value, option);
    });

    return Array.from(deduped.values());
  }, [cachedSelectedOption, mapOption, query.data?.pages, selectedOption]);

  const selectedLabel = options.find((option) => option.value === value)?.label;

  function handleViewportScroll(event: React.UIEvent<HTMLDivElement>) {
    const target = event.currentTarget;
    const remaining = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (remaining < 48 && query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  }

  return (
    <Select
      disabled={disabled}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setSearch("");
          setDebouncedSearch("");
        }
      }}
      value={value}
      onValueChange={(nextValue) => {
        const nextSelectedOption =
          options.find((option) => option.value === nextValue) ?? null;

        if (nextSelectedOption) {
          setCachedSelectedOption(nextSelectedOption);
        }

        onValueChange(nextValue);
      }}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder}>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent
        withSearch={false}
        viewportProps={{
          className: "max-h-72 overflow-y-auto p-1",
          onScroll: handleViewportScroll,
        }}
        emptyMessage={emptyMessage}
      >
        <div className="border-b border-slate-200 p-2">
          <Input
            ref={inputRef}
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            onKeyDownCapture={(event) => event.stopPropagation()}
            onKeyUpCapture={(event) => event.stopPropagation()}
            placeholder={searchPlaceholder}
            className="h-9"
          />
        </div>

        {!query.isLoading && !options.length ? (
          <div className="px-3 py-4 text-sm text-slate-500">{emptyMessage}</div>
        ) : null}

        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}

        {query.isLoading || query.isFetchingNextPage ? (
          <div className="px-3 py-3 text-sm text-slate-500">{loadingMessage}</div>
        ) : null}
      </SelectContent>
    </Select>
  );
}
