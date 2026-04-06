"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  from: number | null;
  to: number | null;
  onPageChange: (page: number) => void;
  isDisabled?: boolean;
  className?: string;
}

function buildVisiblePages(currentPage: number, lastPage: number) {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, lastPage, currentPage - 1, currentPage, currentPage + 1]);

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }

  if (currentPage >= lastPage - 2) {
    pages.add(lastPage - 1);
    pages.add(lastPage - 2);
    pages.add(lastPage - 3);
  }

  return Array.from(pages).filter((page) => page >= 1 && page <= lastPage).sort((left, right) => left - right);
}

export function Pagination({
  currentPage,
  lastPage,
  total,
  from,
  to,
  onPageChange,
  isDisabled = false,
  className,
}: PaginationProps) {
  if (lastPage <= 1) {
    return null;
  }

  const visiblePages = buildVisiblePages(currentPage, lastPage);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 px-4 py-4 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <p className="text-sm text-slate-500">
        Exibindo <span className="font-medium text-slate-900">{from ?? 0}</span> a{" "}
        <span className="font-medium text-slate-900">{to ?? 0}</span> de{" "}
        <span className="font-medium text-slate-900">{total}</span> registros
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isDisabled || currentPage <= 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        {visiblePages.map((page, index) => {
          const previousPage = visiblePages[index - 1];
          const shouldShowGap = previousPage && page - previousPage > 1;

          return (
            <div key={page} className="flex items-center gap-2">
              {shouldShowGap ? (
                <span className="flex h-9 w-9 items-center justify-center text-slate-400">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : null}

              <Button
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                className="min-w-9"
                onClick={() => onPageChange(page)}
                disabled={isDisabled}
              >
                {page}
              </Button>
            </div>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isDisabled || currentPage >= lastPage}
        >
          Proxima
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
