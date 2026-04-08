"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { ArmamentUnitsPageShell } from "@/components/armaments/units-page-shell";
import { formatDate } from "@/components/armament-reports/shared";
import { Pagination } from "@/components/ui/pagination";
import { useArmamentPanelReport } from "@/hooks/use-armament-reports";
import { usePermissions } from "@/hooks/use-permissions";
import { useParams } from "next/navigation";
import { getArmamentUnitBadgeVariant } from "@/types/armament-unit.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 10;

export function ArmamentUnitsListPage() {
  const params = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("armaments");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [expiration, setExpiration] = useState("all");
  const [page, setPage] = useState(1);
  const panelQuery = useArmamentPanelReport(
    params.id,
    Boolean(activeSubunit && permissions.canView),
  );
  const units = panelQuery.data?.data.units ?? [];

  const filteredUnits = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return units.filter((unit) => {
      const matchesSearch = normalizedSearch
        ? [
            unit.serial_number,
            unit.status?.label,
            unit.status?.value,
            unit.expiration_date,
          ]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(normalizedSearch))
        : true;

      const matchesStatus = status === "all" ? true : unit.status?.value === status;
      const matchesExpiration =
        expiration === "all"
          ? true
          : expiration === "expired"
            ? unit.is_expired
            : expiration === "expiring"
              ? unit.is_expiring_soon && !unit.is_expired
              : !unit.is_expired && !unit.is_expiring_soon;

      return matchesSearch && matchesStatus && matchesExpiration;
    });
  }, [expiration, search, status, units]);

  const currentPage = Math.min(page, Math.max(1, Math.ceil(filteredUnits.length / PAGE_SIZE)));
  const paginatedUnits = filteredUnits.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const availableUnits = units.filter((unit) => unit.status?.value === "available").length;
  const expiringUnits = units.filter((unit) => unit.is_expired || unit.is_expiring_soon).length;
  const unavailableUnits = units.filter((unit) => unit.status?.value !== "available").length;

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setExpiration("all");
    setPage(1);
  }

  return (
    <ArmamentUnitsPageShell
      title="Gestão de unidades"
      description="Acompanhe e organize as unidades fisicas vinculadas a este armamento."
      requiredPermission="view"
    >
      <div className="flex justify-end">
        {permissions.canCreate ? (
          <Button asChild variant="outline">
            <Link href="./units/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova unidade
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Disponíveis</CardTitle>
            <CardDescription>
              Quantidade de unidades aptas para uso operacional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">
              {panelQuery.isLoading ? "--" : availableUnits}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Com vencimento</CardTitle>
            <CardDescription>
              Unidades que exigem acompanhamento de prazo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">
              {panelQuery.isLoading ? "--" : expiringUnits}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Indisponiveis</CardTitle>
            <CardDescription>
              Emprestadas, cedidas, em manutenção, baixadas ou extraviadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">
              {panelQuery.isLoading ? "--" : unavailableUnits}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Unidades cadastradas</CardTitle>
          <CardDescription>
            Consulta montada a partir do endpoint `armament-panel/{`{id}`}`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input
              placeholder="Buscar por série, status ou vencimento"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />

            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="loaned">Emprestado</SelectItem>
                <SelectItem value="assigned">Cedido</SelectItem>
                <SelectItem value="maintenance">Em manutenção</SelectItem>
                <SelectItem value="discharged">Baixado</SelectItem>
                <SelectItem value="lost">Extraviado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={expiration}
              onValueChange={(value) => {
                setExpiration(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vencimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os prazos</SelectItem>
                <SelectItem value="expired">Vencidas</SelectItem>
                <SelectItem value="expiring">A vencer</SelectItem>
                <SelectItem value="regular">Regulares</SelectItem>
              </SelectContent>
            </Select>

            <Button type="button" variant="outline" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>

          {panelQuery.isLoading ? (
            <p className="text-sm text-slate-500">Carregando unidades...</p>
          ) : panelQuery.isError ? (
            <p className="text-sm text-rose-600">
              Não foi possível carregar as unidades deste armamento.
            </p>
          ) : paginatedUnits.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Série</th>
                      <th className="px-4 py-3 font-medium">Aquisição</th>
                      <th className="px-4 py-3 font-medium">Vencimento</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Situação</th>
                      <th className="px-4 py-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUnits.map((unit) => (
                      <tr key={unit.id} className="border-t border-slate-200/70">
                        <td className="px-4 py-4 font-medium text-slate-900">
                          {unit.serial_number ?? "-"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {formatDate(unit.acquisition_date)}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {formatDate(unit.expiration_date)}
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            variant={getArmamentUnitBadgeVariant(unit.status?.color)}
                          >
                            {unit.status?.label ?? "-"}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {unit.is_expired
                            ? "Vencida"
                            : unit.is_expiring_soon
                              ? "A vencer"
                              : "Regular"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            {permissions.canView ? (
                              <Button asChild size="sm" variant="outline">
                                <Link href={`./units/${unit.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver
                                </Link>
                              </Button>
                            ) : null}
                            {permissions.canUpdate ? (
                              <Button asChild size="sm" variant="outline">
                                <Link href={`./units/${unit.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                lastPage={Math.max(1, Math.ceil(filteredUnits.length / PAGE_SIZE))}
                total={filteredUnits.length}
                from={filteredUnits.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}
                to={Math.min(currentPage * PAGE_SIZE, filteredUnits.length)}
                onPageChange={setPage}
              />
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Nenhuma unidade encontrada com os filtros atuais.
            </p>
          )}
        </CardContent>
      </Card>
    </ArmamentUnitsPageShell>
  );
}
