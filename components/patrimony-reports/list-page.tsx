"use client";

import Link from "next/link";
import { ArrowRightLeft, BarChart3, Landmark, MapPinned, ShieldAlert } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const reportCards = [
  { title: "Patrimônios por status", description: "Distribuição consolidada por status e valor de aquisição.", href: "/patrimony-reports/status-overview", icon: BarChart3 },
  { title: "Distribuição por tipo", description: "Comparativo por tipo com ativos, baixados e valor total.", href: "/patrimony-reports/type-distribution", icon: Landmark },
  { title: "Distribuição por setor", description: "Leitura da alocação patrimonial por setor atual.", href: "/patrimony-reports/sector-distribution", icon: MapPinned },
  { title: "Patrimônios ativos", description: "Listagem operacional dos bens atualmente ativos.", href: "/patrimony-reports/active", icon: Landmark },
  { title: "Baixas patrimoniais", description: "Patrimônios devolvidos ou inutilizados com motivo e protocolo.", href: "/patrimony-reports/write-offs", icon: ShieldAlert },
  { title: "Movimentações", description: "Histórico setorial paginado de transferências patrimoniais.", href: "/patrimony-reports/movements", icon: ArrowRightLeft },
  { title: "Custos de aquisição", description: "Resumo financeiro por tipo patrimonial com médias e extremos.", href: "/patrimony-reports/acquisition-costs", icon: BarChart3 },
];

export function PatrimonyReportsListPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("patrimonies");

  if (!hasPermission(user, "reports") || !permissions.canViewAny) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Acesso negado</CardTitle><CardDescription>Você precisa do slug `reports` e da permissão `patrimonies.viewAny` para acessar os relatórios.</CardDescription></CardHeader></Card>;
  }

  if (!activeSubunit) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Selecione uma subunidade</CardTitle><CardDescription>Os relatórios de patrimônios dependem da subunidade ativa para enviar `X-SUBUNIT-ACTIVE`.</CardDescription></CardHeader></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm"><Landmark className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">Relatórios de patrimônios</h1>
          <p className="text-sm text-slate-500">Módulo analítico para distribuição, movimentações, baixas e custos de aquisição patrimonial.</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Contexto ativo: {activeSubunit.name}</p>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {reportCards.map((card) => (
          <Card key={card.title} className="border-slate-200/70 bg-white/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-primary"><card.icon className="h-5 w-5" /></div>
                <div><CardTitle>{card.title}</CardTitle><CardDescription>Disponível agora</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">{card.description}</p>
              <Button asChild variant="outline"><Link href={card.href}>Abrir relatório</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
