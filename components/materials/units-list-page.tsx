"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { MaterialUnitsPageShell } from "@/components/materials/units-page-shell";
import { useMaterial } from "@/hooks/use-materials";
import { usePermissions } from "@/hooks/use-permissions";
import { useParams } from "next/navigation";
import { getMaterialUnitBadgeVariant, getMaterialUnitStatusLabel } from "@/types/material.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialUnitsListPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("materials");
  const materialQuery = useMaterial(params.id);
  const units = materialQuery.data?.data.units ?? [];
  const availableUnits = units.filter((unit) => unit.status === "available").length;
  const expiringUnits = units.filter((unit) => {
    if (!unit.expiration_date) {
      return false;
    }

    const expiration = new Date(unit.expiration_date);
    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() + 30);
    return expiration >= now && expiration <= limit;
  }).length;
  const unavailableUnits = units.filter((unit) => unit.status && unit.status !== "available").length;

  return (
    <MaterialUnitsPageShell
      title="Gestão de unidades"
      description="Acompanhe e organize as unidades fisicas vinculadas a este material."
      requiredPermission="view"
      showIntegrationNotice
    >
      <div className="flex justify-end">
        {permissions.canCreate ? (
          <Button asChild>
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
            <CardDescription>Quantidade de unidades aptas para uso operacional.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">{availableUnits}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Com vencimento</CardTitle>
            <CardDescription>Unidades que exigem acompanhamento de prazo.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">{expiringUnits}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Indisponiveis</CardTitle>
            <CardDescription>Emprestadas, cedidas, em manutenção, baixadas ou extraviadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">{unavailableUnits}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Unidades cadastradas</CardTitle>
          <CardDescription>Lista obtida a partir do payload atual de `Material.show`.</CardDescription>
        </CardHeader>
        <CardContent>
          {units.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Patrimônio 1</th>
                    <th className="px-4 py-3 font-medium">Patrimônio 2</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Vencimento</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit) => (
                    <tr key={unit.id} className="border-t border-slate-200/70">
                      <td className="px-4 py-4 text-slate-600">{unit.patrimony_number_1 ?? "-"}</td>
                      <td className="px-4 py-4 text-slate-600">{unit.patrimony_number_2 ?? "-"}</td>
                      <td className="px-4 py-4">
                        <Badge variant={getMaterialUnitBadgeVariant(unit.status_color)}>
                          {unit.status_label ?? getMaterialUnitStatusLabel(unit.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{unit.expiration_date ?? "-"}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {permissions.canView ? (
                            <Button asChild size="sm" variant="outline">
                              <Link href={`./units/${unit.id}`}>Ver</Link>
                            </Button>
                          ) : null}
                          {permissions.canUpdate ? (
                            <Button asChild size="sm" variant="outline">
                              <Link href={`./units/${unit.id}/edit`}>Editar</Link>
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhuma unidade cadastrada para este material.</p>
          )}
        </CardContent>
      </Card>
    </MaterialUnitsPageShell>
  );
}
