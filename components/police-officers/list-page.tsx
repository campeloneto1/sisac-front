"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import {
  usePoliceOfficerBanks,
  usePoliceOfficerCities,
  usePoliceOfficerEducationLevels,
  usePoliceOfficerGenders,
  usePoliceOfficers,
} from "@/hooks/use-police-officers";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PoliceOfficersFilters } from "@/components/police-officers/filters";
import { PoliceOfficersTable } from "@/components/police-officers/table";

export function PoliceOfficersListPage() {
  const permissions = usePermissions("police-officers");
  const [search, setSearch] = useState("");
  const [cityId, setCityId] = useState("all");
  const [bankId, setBankId] = useState("all");
  const [genderId, setGenderId] = useState("all");
  const [educationLevelId, setEducationLevelId] = useState("all");
  const [isActive, setIsActive] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      city_id: cityId !== "all" ? Number(cityId) : null,
      bank_id: bankId !== "all" ? Number(bankId) : null,
      gender_id: genderId !== "all" ? Number(genderId) : null,
      education_level_id: educationLevelId !== "all" ? Number(educationLevelId) : null,
      is_active: isActive === "all" ? null : isActive === "active",
    }),
    [bankId, cityId, educationLevelId, genderId, isActive, page, search],
  );

  const policeOfficersQuery = usePoliceOfficers(filters);
  const banksQuery = usePoliceOfficerBanks();
  const citiesQuery = usePoliceOfficerCities();
  const gendersQuery = usePoliceOfficerGenders();
  const educationLevelsQuery = usePoliceOfficerEducationLevels();

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `viewAny` para visualizar policiais.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Policiais</h1>
          <p className="text-sm text-slate-500">Gestao completa do cadastro de policiais militares, seus dados pessoais e vinculos funcionais.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/police-officers/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo policial
            </Link>
          </Button>
        ) : null}
      </div>

      <PoliceOfficersFilters
        search={search}
        cityId={cityId}
        bankId={bankId}
        genderId={genderId}
        educationLevelId={educationLevelId}
        isActive={isActive}
        cities={citiesQuery.data?.data ?? []}
        banks={banksQuery.data?.data ?? []}
        genders={gendersQuery.data?.data ?? []}
        educationLevels={educationLevelsQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCityChange={(value) => {
          setCityId(value);
          setPage(1);
        }}
        onBankChange={(value) => {
          setBankId(value);
          setPage(1);
        }}
        onGenderChange={(value) => {
          setGenderId(value);
          setPage(1);
        }}
        onEducationLevelChange={(value) => {
          setEducationLevelId(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setIsActive(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setCityId("all");
          setBankId("all");
          setGenderId("all");
          setEducationLevelId("all");
          setIsActive("all");
          setPage(1);
        }}
      />

      {policeOfficersQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : policeOfficersQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar policiais</CardTitle>
            <CardDescription>Verifique a API e as permissoes do usuario autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !policeOfficersQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum policial encontrado</CardTitle>
            <CardDescription>Crie um novo policial ou refine os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <PoliceOfficersTable policeOfficers={policeOfficersQuery.data.data} />
          <Pagination
            currentPage={policeOfficersQuery.data.meta.current_page}
            lastPage={policeOfficersQuery.data.meta.last_page}
            total={policeOfficersQuery.data.meta.total}
            from={policeOfficersQuery.data.meta.from}
            to={policeOfficersQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={policeOfficersQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
