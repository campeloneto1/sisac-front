"use client";

import Link from "next/link";
import { BarChart3, Layers3, Shield, Users } from "lucide-react";

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
          <CardDescription>Os relatórios de policiais dependem da subunidade ativa para enviar `X-Active-Subunit`.</CardDescription>
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
