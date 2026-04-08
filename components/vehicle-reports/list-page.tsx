"use client";

import Link from "next/link";
import { BarChart3, CarFront, Droplets, FileWarning, Fuel, Shield, Wrench } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const reportCards = [
  {
    title: "Frota por status",
    description: "Leitura consolidada da frota por disponibilidade, posse, blindagem e aptidão para viagem.",
    href: "/vehicle-reports/fleet-status",
    icon: BarChart3,
  },
  {
    title: "Composição da frota",
    description: "Distribuição por tipo e variante, com destaque para frota ativa e composição própria ou locada.",
    href: "/vehicle-reports/fleet-composition",
    icon: CarFront,
  },
  {
    title: "Veículos disponíveis",
    description: "Lista operacional para planejamento de uso no período informado.",
    href: "/vehicle-reports/available",
    icon: CarFront,
  },
  {
    title: "Veículos indisponíveis",
    description: "Mostra o motivo da indisponibilidade e os vínculos ativos que bloqueiam o uso.",
    href: "/vehicle-reports/unavailable",
    icon: FileWarning,
  },
  {
    title: "Empréstimos",
    description: "Histórico paginado de empréstimos, com filtros por veículo, cidade, período e status.",
    href: "/vehicle-reports/loans",
    icon: Shield,
  },
  {
    title: "Empréstimos ativos",
    description: "Consulta operacional dos veículos atualmente em uso.",
    href: "/vehicle-reports/active-loans",
    icon: Shield,
  },
  {
    title: "Cautelas ativas",
    description: "Visão dos veículos atualmente cautelados e dos respectivos custodiante.",
    href: "/vehicle-reports/active-custodies",
    icon: Shield,
  },
  {
    title: "Manutenções",
    description: "Acompanhamento paginado das ordens por tipo, oficina, status e atraso.",
    href: "/vehicle-reports/maintenances",
    icon: Wrench,
  },
  {
    title: "Custos de manutenção",
    description: "Visão analítica por veículo com custo total, peças, mão de obra e volume preventivo/corretivo.",
    href: "/vehicle-reports/maintenance-costs",
    icon: Wrench,
  },
  {
    title: "Abastecimentos",
    description: "Histórico paginado de abastecimentos com quilometragem, litros e posto.",
    href: "/vehicle-reports/fuelings",
    icon: Fuel,
  },
  {
    title: "Custos de abastecimento",
    description: "Resumo por veículo com custo total, litros consumidos e preço médio por litro.",
    href: "/vehicle-reports/fuel-costs",
    icon: Droplets,
  },
  {
    title: "Avarias",
    description: "Relatório operacional com resumo por gravidade e status de reparo.",
    href: "/vehicle-reports/damages",
    icon: FileWarning,
  },
  {
    title: "Locações",
    description: "Consulta paginada dos contratos de locação por empresa, período e status.",
    href: "/vehicle-reports/rentals",
    icon: CarFront,
  },
  {
    title: "Locações a vencer",
    description: "Foco em contratos ativos com vencimento próximo para gestão preventiva.",
    href: "/vehicle-reports/expiring-rentals",
    icon: BarChart3,
  },
];

export function VehicleReportsListPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("vehicles");

  if (!hasPermission(user, "reports") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa do slug `reports` e da permissão `vehicles.viewAny` para acessar os relatórios.
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
          <CardDescription>Os relatórios de veículos dependem da subunidade ativa para enviar `X-SUBUNIT-ACTIVE`.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <CarFront className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">Relatórios de veículos</h1>
          <p className="text-sm text-slate-500">
            Módulo analítico da frota para disponibilidade, uso, manutenção, abastecimento, avarias e locações.
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
                  <CardDescription>Disponível agora</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">{card.description}</p>
              <Button asChild variant="outline">
                <Link href={card.href}>Abrir relatório</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
