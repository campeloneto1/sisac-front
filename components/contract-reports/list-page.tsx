"use client";

import Link from "next/link";
import { AlertTriangle, BarChart3, CalendarClock, FileText, Landmark, ReceiptText, Workflow } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const reportCards = [
  { title: "Contratos por status", description: "Distribuição consolidada dos contratos por status, valor e execução.", href: "/contract-reports/status-overview", icon: BarChart3 },
  { title: "Execução financeira", description: "Resumo por empresa com total contratado, executado, saldo e percentual.", href: "/contract-reports/execution-overview", icon: Landmark },
  { title: "Contratos ativos", description: "Listagem operacional dos contratos ativos da subunidade corrente.", href: "/contract-reports/active", icon: FileText },
  { title: "Contratos a vencer", description: "Visão preventiva dos contratos próximos do vencimento.", href: "/contract-reports/expiring", icon: CalendarClock },
  { title: "Transações contratuais", description: "Histórico financeiro paginado de empenhos, liquidações e pagamentos.", href: "/contract-reports/transactions", icon: ReceiptText },
  { title: "Alertas contratuais", description: "Alertas de execução e vencimento com status de tratamento.", href: "/contract-reports/alerts", icon: AlertTriangle },
  { title: "Mudanças de status", description: "Trilha formal das mudanças de status dos contratos.", href: "/contract-reports/status-changes", icon: Workflow },
];

export function ContractReportsListPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("contracts");

  if (!hasPermission(user, "reports") || !permissions.canViewAny) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Acesso negado</CardTitle><CardDescription>Você precisa do slug `reports` e da permissão `contracts.viewAny` para acessar os relatórios.</CardDescription></CardHeader></Card>;
  }

  if (!activeSubunit) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Selecione uma subunidade</CardTitle><CardDescription>Os relatórios de contratos dependem da subunidade ativa para enviar `X-SUBUNIT-ACTIVE`.</CardDescription></CardHeader></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm"><FileText className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">Relatórios de contratos</h1>
          <p className="text-sm text-slate-500">Módulo analítico para status, execução financeira, alertas, transações e vigência contratual.</p>
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
