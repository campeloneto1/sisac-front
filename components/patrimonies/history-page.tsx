"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, History } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { usePatrimony, usePatrimonyHistory } from "@/hooks/use-patrimonies";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PatrimonyHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("patrimonies");
  const isEnabled = Boolean(activeSubunit) && permissions.canView;
  const patrimonyQuery = usePatrimony(id, isEnabled);
  const historyQuery = usePatrimonyHistory(id, isEnabled);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `view` para acessar o histórico setorial.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>
            O histórico setorial depende da subunidade ativa para enviar `X-Active-Subunit`.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Histórico setorial
            </h1>
            <p className="text-sm text-slate-500">
              Trilha de alocações e transferências do patrimônio atual.
            </p>
            {patrimonyQuery.data?.data ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <Link
                  href={`/patrimonies/${id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {patrimonyQuery.data.data.code}
                </Link>
                <ArrowRight className="h-4 w-4 text-slate-300" />
                <span>{patrimonyQuery.data.data.patrimony_type?.name || "-"}</span>
              </div>
            ) : null}
          </div>
        </div>

        <Button asChild variant="outline">
          <Link href={`/patrimonies/${id}`}>Voltar ao patrimônio</Link>
        </Button>
      </div>

      {patrimonyQuery.isLoading || historyQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : patrimonyQuery.isError || !patrimonyQuery.data?.data ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Patrimônio indisponivel</CardTitle>
            <CardDescription>
              Não foi possível carregar o patrimônio vinculado a esse histórico.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : historyQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar histórico</CardTitle>
            <CardDescription>
              Verifique a API, a subunidade ativa e as permissões do usuário.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !historyQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma movimentacao encontrada</CardTitle>
            <CardDescription>
              Este patrimônio ainda não possui eventos de histórico setorial.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-slate-200/70 bg-white/80">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Origem</th>
                    <th className="px-4 py-3 font-medium">Destino</th>
                    <th className="px-4 py-3 font-medium">Momento</th>
                    <th className="px-4 py-3 font-medium">Responsável</th>
                    <th className="px-4 py-3 font-medium">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {historyQuery.data.data.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200/70 align-top">
                      <td className="px-4 py-4 text-slate-600">
                        {item.from_sector?.abbreviation ||
                          item.from_sector?.name ||
                          "Alocacao inicial"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {item.to_sector?.abbreviation ||
                          item.to_sector?.name ||
                          "Sem destino"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDateTime(item.transferred_at)}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {item.transferred_by
                          ? `${item.transferred_by.name} (${item.transferred_by.email})`
                          : "Não informado"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {item.reason || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
