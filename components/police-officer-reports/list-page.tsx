"use client";

import Link from "next/link";
import { BarChart3, CalendarClock, FileHeart, Layers3, Shield, ShieldCheck, Users, Workflow } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const reportCards = [
  {
    title: "Ativos e inativos",
    description: "Lista paginada com filtros, totalizadores e visão operacional do efetivo atual.",
    href: "/police-officer-reports/active-inactive",
    icon: Users,
    available: true,
  },
  {
    title: "Efetivo por setor",
    description: "Leitura agregada por setor com distribuição por função e graduação.",
    href: "/police-officer-reports/effective-by-sector",
    icon: Layers3,
    available: true,
  },
  {
    title: "Distribuição por graduação",
    description: "Resumo analítico por graduação atual, com ativos e inativos.",
    href: "/police-officer-reports/rank-distribution",
    icon: BarChart3,
    available: true,
  },
  {
    title: "Afastamentos",
    description: "Listagem operacional de afastamentos com filtros por tipo, status, COPEM e período.",
    href: "/police-officer-reports/leaves",
    icon: FileHeart,
    available: true,
  },
  {
    title: "Afastamentos por tipo",
    description: "Visão gerencial do volume e duração média dos afastamentos por tipo.",
    href: "/police-officer-reports/leaves-by-type-duration",
    icon: BarChart3,
    available: true,
  },
  {
    title: "Férias",
    description: "Acompanhamento paginado de férias por ano de referência, status e período de validade.",
    href: "/police-officer-reports/vacations-overview",
    icon: CalendarClock,
    available: true,
  },
  {
    title: "Saldo de férias",
    description: "Visão consolidada dos saldos e disponibilidade de férias por policial.",
    href: "/police-officer-reports/vacation-balances",
    icon: CalendarClock,
    available: true,
  },
  {
    title: "Histórico de lotações",
    description: "Consulta paginada das lotações por setor, função e período.",
    href: "/police-officer-reports/allocation-history",
    icon: Workflow,
    available: true,
  },
  {
    title: "Aptidão para promoção",
    description: "Painel paginado de elegibilidade à promoção com base no interstício.",
    href: "/police-officer-reports/promotion-eligibility",
    icon: ShieldCheck,
    available: true,
  },
  {
    title: "Histórico de promoções",
    description: "Consulta de promoções por tipo, graduação e período.",
    href: "/police-officer-reports/promotion-history",
    icon: ShieldCheck,
    available: true,
  },
  {
    title: "Pendências COPEM",
    description: "Afastamentos pendentes de agenda, avaliação ou conclusão pela COPEM.",
    href: "/police-officer-reports/pending-copem",
    icon: FileHeart,
    available: true,
  },
  {
    title: "Cursos",
    description: "Visão paginada dos cursos com resumo por status.",
    href: "/police-officer-reports/courses-overview",
    icon: BarChart3,
    available: true,
  },
  {
    title: "Certificados pendentes",
    description: "Policiais aptos a receber certificado e ainda pendentes de emissão.",
    href: "/police-officer-reports/pending-certificates",
    icon: BarChart3,
    available: true,
  },
  {
    title: "Pedidos de aposentadoria",
    description: "Fluxo de pedidos com resumo por status e datas principais.",
    href: "/police-officer-reports/retirement-requests",
    icon: CalendarClock,
    available: true,
  },
] as const;

export function PoliceOfficerReportsListPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("police-officers");

  if (!hasPermission(user, "reports") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa do slug `reports` e da permissão `police-officers.viewAny` para acessar os relatórios.
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
          <CardDescription>Os relatórios de policiais dependem da subunidade ativa para enviar `X-SUBUNIT-ACTIVE`.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">Relatórios de policiais</h1>
          <p className="text-sm text-slate-500">
            Módulo analítico para efetivo, histórico funcional, férias, afastamentos, promoções e aposentadorias.
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
            Contexto ativo: {activeSubunit.name}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {reportCards.map((card) => (
          <Card key={card.title} className="border-slate-200/70 bg-white/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-primary">
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.available ? "Disponível agora" : "Próxima etapa"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">{card.description}</p>
              {card.available ? (
                <Button asChild variant="outline">
                  <Link href={card.href}>Abrir relatório</Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" disabled>
                  Em breve
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
