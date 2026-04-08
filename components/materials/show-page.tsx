"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Boxes, Layers3, Package, Pencil, UserCircle2 } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { useMaterial } from "@/hooks/use-materials";
import { usePermissions } from "@/hooks/use-permissions";
import { getMaterialUnitBadgeVariant, getMaterialUnitStatusLabel } from "@/types/material.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

export function MaterialShowPage() {
  const { id } = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("materials");
  const materialQuery = useMaterial(id, Boolean(activeSubunit) && permissions.canView);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `view` para visualizar materiais.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>O modulo de materiais depende da subunidade ativa para carregar os dados do registro.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (materialQuery.isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  if (materialQuery.isError || !materialQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar material</CardTitle>
          <CardDescription>Os dados do material nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const material = materialQuery.data.data;
  const specificationEntries = Object.entries(material.specifications ?? {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{material.type?.name ?? "Material"}</h1>
            <Badge variant="outline">{material.variant?.name ?? "Variante nao informada"}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Marca: {material.variant?.brand?.name ?? "Nao informada"} • Subunidade: {material.subunit?.abbreviation ?? material.subunit?.name ?? activeSubunit.name}
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/materials/${material.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Resumo operacional</CardTitle>
            <CardDescription>Indicadores principais do material na subunidade ativa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Boxes className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tipo</p>
                <p className="text-sm text-slate-700">{material.type?.name ?? "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Unidades cadastradas</p>
                <p className="text-sm text-slate-700">{material.units?.length ?? material.units_count ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Layers3 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Lotes cadastrados</p>
                <p className="text-sm text-slate-700">{material.batches?.length ?? material.batches_count ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Metadados</CardTitle>
            <CardDescription>Auditoria do registro e contexto atual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">{material.creator ? `${material.creator.name} (${material.creator.email})` : "Nao informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">{material.updater ? `${material.updater.name} (${material.updater.email})` : "Nao informado"}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Timestamps</p>
              <p className="mt-1 text-sm text-slate-700">Criado em: {material.created_at ?? "-"}</p>
              <p className="text-sm text-slate-700">Atualizado em: {material.updated_at ?? "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Especificacoes</CardTitle>
          <CardDescription>Campos livres armazenados no JSON `specifications`.</CardDescription>
        </CardHeader>
        <CardContent>
          {specificationEntries.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {specificationEntries.map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{key}</p>
                  <p className="mt-1 text-sm text-slate-700">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhuma especificacao informada.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Unidades</CardTitle>
          <CardDescription>Unidades individualizadas vinculadas a este material.</CardDescription>
        </CardHeader>
        <CardContent>
          {material.units?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Patrimonio 1</th>
                    <th className="px-4 py-3 font-medium">Patrimonio 2</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Aquisicao</th>
                    <th className="px-4 py-3 font-medium">Vencimento</th>
                  </tr>
                </thead>
                <tbody>
                  {material.units.map((unit) => (
                    <tr key={unit.id} className="border-t border-slate-200/70">
                      <td className="px-4 py-4 text-slate-600">{unit.patrimony_number_1 ?? "-"}</td>
                      <td className="px-4 py-4 text-slate-600">{unit.patrimony_number_2 ?? "-"}</td>
                      <td className="px-4 py-4">
                        <Badge variant={getMaterialUnitBadgeVariant(unit.status_color)}>
                          {unit.status_label ?? getMaterialUnitStatusLabel(unit.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{formatDate(unit.acquisition_date)}</td>
                      <td className="px-4 py-4 text-slate-600">{formatDate(unit.expiration_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhuma unidade cadastrada.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Lotes</CardTitle>
          <CardDescription>Lotes e saldos disponiveis retornados pela API.</CardDescription>
        </CardHeader>
        <CardContent>
          {material.batches?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Lote</th>
                    <th className="px-4 py-3 font-medium">Quantidade</th>
                    <th className="px-4 py-3 font-medium">Disponivel</th>
                    <th className="px-4 py-3 font-medium">Em uso</th>
                    <th className="px-4 py-3 font-medium">Vencimento</th>
                  </tr>
                </thead>
                <tbody>
                  {material.batches.map((batch) => (
                    <tr key={batch.id} className="border-t border-slate-200/70">
                      <td className="px-4 py-4 text-slate-600">{batch.batch_number}</td>
                      <td className="px-4 py-4 text-slate-600">{batch.quantity}</td>
                      <td className="px-4 py-4 text-slate-600">{batch.available_quantity ?? "-"}</td>
                      <td className="px-4 py-4 text-slate-600">{batch.used_quantity ?? "-"}</td>
                      <td className="px-4 py-4 text-slate-600">{formatDate(batch.expiration_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhum lote cadastrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
