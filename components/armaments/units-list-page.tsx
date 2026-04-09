"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { ArmamentUnitsPageShell } from "@/components/armaments/units-page-shell";
import { formatDate } from "@/components/armament-reports/shared";
import { Pagination } from "@/components/ui/pagination";
import { useArmamentPanelReport } from "@/hooks/use-armament-reports";
import { useArmamentUnits } from "@/hooks/use-armament-units";
import { useDeleteArmamentUnitMutation } from "@/hooks/use-armament-unit-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { useParams } from "next/navigation";
import {
  type ArmamentUnitItem,
  type ArmamentUnitStatus,
  getArmamentUnitBadgeVariant,
} from "@/types/armament-unit.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [unitToDelete, setUnitToDelete] = useState<ArmamentUnitItem | null>(null);
  const deleteMutation = useDeleteArmamentUnitMutation(params.id);
  const panelQuery = useArmamentPanelReport(
    params.id,
    Boolean(activeSubunit && permissions.canView),
  );
  const unitsQuery = useArmamentUnits(
    params.id,
    {
      page,
      per_page: PAGE_SIZE,
      search: search.trim() || undefined,
      status: status === "all" ? null : (status as ArmamentUnitStatus),
      expiration:
        expiration === "all"
          ? null
          : (expiration as "expired" | "expiring" | "regular"),
    },
    Boolean(activeSubunit && permissions.canView),
  );
  const units = panelQuery.data?.data.units ?? [];
  const paginatedUnits = unitsQuery.data?.data ?? [];
  const currentPage = unitsQuery.data?.meta.current_page ?? page;
  const totalUnits = unitsQuery.data?.meta.total ?? 0;
  const from = unitsQuery.data?.meta.from ?? 0;
  const to = unitsQuery.data?.meta.to ?? 0;
  const lastPage = unitsQuery.data?.meta.last_page ?? 1;

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
      showIntegrationNotice={false}
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
            Consulta e gestão persistida das unidades vinculadas a este armamento.
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

          {unitsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Carregando unidades...</p>
          ) : unitsQuery.isError ? (
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
                            {permissions.canDelete ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setUnitToDelete(unit)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
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
                lastPage={lastPage}
                total={totalUnits}
                from={from}
                to={to}
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

      <Dialog
        open={Boolean(unitToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setUnitToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir unidade</DialogTitle>
            <DialogDescription>
              Confirme a exclusão da unidade
              {unitToDelete?.serial_number
                ? ` "${unitToDelete.serial_number}"`
                : ` #${unitToDelete?.id ?? ""}`}
              . Se houver vínculos operacionais, a API pode recusar a remoção.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setUnitToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending || !unitToDelete}
              onClick={async () => {
                if (!unitToDelete) {
                  return;
                }

                await deleteMutation.mutateAsync(unitToDelete.id);
                setUnitToDelete(null);
              }}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ArmamentUnitsPageShell>
  );
}
