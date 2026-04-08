"use client";

import Link from "next/link";
import { BarChart3, ClipboardList, History, ShieldCheck, Wrench } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const reportCards = [
  { title: "Serviços por status", description: "Distribuição consolidada dos serviços por estágio e impacto financeiro.", href: "/service-reports/status-overview", icon: BarChart3 },
  { title: "Serviços por prioridade", description: "Volume por prioridade com destaque para carga ainda aberta.", href: "/service-reports/priority-overview", icon: ShieldCheck },
  { title: "Serviços por tipo", description: "Comparativo por tipo de serviço, concluídos, cancelados e custos.", href: "/service-reports/by-type", icon: BarChart3 },
  { title: "Backlog operacional", description: "Fila operacional paginada com filtros por empresa, setor, tipo, datas e atraso.", href: "/service-reports/operational-backlog", icon: ClipboardList },
  { title: "Serviços concluídos", description: "Relatório paginado dos serviços encerrados com observações e avaliação.", href: "/service-reports/completed", icon: Wrench },
  { title: "Resumo de custos", description: "Consolidação financeira por empresa com médias estimadas e realizadas.", href: "/service-reports/cost-summary", icon: BarChart3 },
  { title: "Mudanças de status", description: "Trilha operacional das transições de status por usuário e período.", href: "/service-reports/status-changes", icon: History },
];

export function ServiceReportsListPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("services");

  if (!hasPermission(user, "reports") || !permissions.canViewAny) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Acesso negado</CardTitle><CardDescription>Você precisa do slug `reports` e da permissão `services.viewAny` para acessar os relatórios.</CardDescription></CardHeader></Card>;
  }

  if (!activeSubunit) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Selecione uma subunidade</CardTitle><CardDescription>Os relatórios de serviços dependem da subunidade ativa para enviar `X-SUBUNIT-ACTIVE`.</CardDescription></CardHeader></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm"><Wrench className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">Relatórios de serviços</h1>
          <p className="text-sm text-slate-500">Módulo analítico para distribuição, backlog, custos, conclusão e histórico operacional dos serviços.</p>
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
