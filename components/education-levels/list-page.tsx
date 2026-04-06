"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useEducationLevels } from "@/hooks/use-education-levels";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EducationLevelsFilters } from "@/components/education-levels/filters";
import { EducationLevelsTable } from "@/components/education-levels/table";

export function EducationLevelsListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("education-levels");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
    }),
    [page, search],
  );
  const educationLevelsQuery = useEducationLevels(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `education-levels.viewAny` para visualizar niveis de escolaridade.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Niveis de escolaridade</h1>
          <p className="text-sm text-slate-500">Gerencie o cadastro administrativo de escolaridade utilizado por policiais e outros modulos.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/education-levels/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo nivel
            </Link>
          </Button>
        ) : null}
      </div>

      <EducationLevelsFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setPage(1);
        }}
      />

      {educationLevelsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : educationLevelsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar niveis de escolaridade</CardTitle>
            <CardDescription>Verifique a API e as permissoes do usuario autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !educationLevelsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum nivel encontrado</CardTitle>
            <CardDescription>Crie um novo nivel de escolaridade ou refine a busca.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <EducationLevelsTable educationLevels={educationLevelsQuery.data.data} />
          <Pagination
            currentPage={educationLevelsQuery.data.meta.current_page}
            lastPage={educationLevelsQuery.data.meta.last_page}
            total={educationLevelsQuery.data.meta.total}
            from={educationLevelsQuery.data.meta.from}
            to={educationLevelsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={educationLevelsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
