"use client";

import Link from "next/link";
import { BarChart3, Boxes, Crosshair, FileWarning, PackageSearch, Shield, Waypoints } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const reportCards = [
  { title: "Inventário", description: "Consolidado por armamento com unidades por status e saldo em lotes.", href: "/armament-reports/inventory", icon: BarChart3 },
  { title: "Disponibilidade", description: "Resumo agregado das unidades por status operacional.", href: "/armament-reports/availability", icon: BarChart3 },
  { title: "Unidades disponíveis", description: "Lista paginada das unidades disponíveis para uso.", href: "/armament-reports/available-units", icon: Crosshair },
  { title: "Lotes disponíveis", description: "Lotes com saldo utilizável e percentual disponível.", href: "/armament-reports/available-batches", icon: Boxes },
  { title: "Unidades vencidas/a vencer", description: "Controle de validade das unidades com janela configurável.", href: "/armament-reports/expiring-units", icon: PackageSearch },
  { title: "Lotes vencidos/a vencer", description: "Controle de validade dos lotes com foco preventivo.", href: "/armament-reports/expiring-batches", icon: PackageSearch },
  { title: "Empréstimos", description: "Histórico operacional de empréstimos de armamento.", href: "/armament-reports/loans", icon: Shield },
  { title: "Empréstimos ativos", description: "Empréstimos em aberto e em atraso.", href: "/armament-reports/active-loans", icon: Shield },
  { title: "Cautelas", description: "Empréstimos do tipo cautela para acompanhamento operacional.", href: "/armament-reports/cautelas", icon: Shield },
  { title: "Divergências de devolução", description: "Registros com consumo, perda ou divergência na devolução.", href: "/armament-reports/return-divergences", icon: FileWarning },
  { title: "Movimentações", description: "Histórico de entradas, saídas, cautelas, baixas e ajustes.", href: "/armament-reports/movements", icon: Waypoints },
  { title: "Ocorrências", description: "Ocorrências com resumo por tipo e status.", href: "/armament-reports/occurrences", icon: FileWarning },
  { title: "Ocorrências críticas", description: "Extravio e furto/roubo com foco em resposta prioritária.", href: "/armament-reports/critical-occurrences", icon: FileWarning },
];

export function ArmamentReportsListPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("armaments");

  if (!hasPermission(user, "reports") || !permissions.canViewAny) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Acesso negado</CardTitle><CardDescription>Você precisa do slug `reports` e da permissão `armaments.viewAny` para acessar os relatórios.</CardDescription></CardHeader></Card>;
  }

  if (!activeSubunit) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Selecione uma subunidade</CardTitle><CardDescription>Os relatórios de armamentos dependem da subunidade ativa para enviar `X-SUBUNIT-ACTIVE`.</CardDescription></CardHeader></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm"><Crosshair className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">Relatórios de armamentos</h1>
          <p className="text-sm text-slate-500">Módulo analítico para inventário, disponibilidade, empréstimos, movimentações e ocorrências.</p>
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
