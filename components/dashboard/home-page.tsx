"use client";

import Link from "next/link";
import { useState } from "react";
import { CarFront, Crosshair, FileText, Shield } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { useHome } from "@/hooks/use-home";
import { usePermissions } from "@/hooks/use-permissions";
import { getContractAlertBadgeVariant } from "@/types/contract-alert.type";
import { getContractStatusBadgeVariant } from "@/types/contract.type";
import { MyVehicleCard } from "@/components/vehicle-operations/my-vehicle-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("pt-BR").format(value ?? 0);
}

function formatPercent(value?: number | null) {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value ?? 0)}%`;
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);
}

function formatArmamentLabel(item: { type?: string | null; variant?: string | null; caliber?: string | null; size?: string | null }) {
  return [item.type, item.variant, item.caliber, item.size].filter(Boolean).join(" • ") || "Armamento";
}

function SummaryGrid({
  title,
  description,
  items,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  items: Array<{ label: string; value?: number | null }>;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) {
  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(item.value)}</p>
            </div>
          ))}
        </div>
        <Button asChild variant="outline">
          <Link href={href}>Abrir módulo</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function DashboardHomePage() {
  const { isReady } = useAuth();
  const { activeSubunit } = useSubunit();
  const policePermissions = usePermissions("police-officers");
  const vehiclePermissions = usePermissions("vehicles");
  const armamentPermissions = usePermissions("armaments");
  const contractPermissions = usePermissions("contracts");
  const homeQuery = useHome(isReady && Boolean(activeSubunit));
  const [activeTab, setActiveTab] = useState<string>("");
  const home = homeQuery.data?.data;

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>A dashboard inicial depende da subunidade ativa para carregar o resumo operacional.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (homeQuery.isLoading) {
    return (
      <div className="space-y-6">
        <MyVehicleCard />
        <Skeleton className="h-48 w-full rounded-[24px]" />
        <div className="grid gap-4 xl:grid-cols-3">
          <Skeleton className="h-64 rounded-[24px]" />
          <Skeleton className="h-64 rounded-[24px]" />
          <Skeleton className="h-64 rounded-[24px]" />
        </div>
      </div>
    );
  }

  if (homeQuery.isError || !home) {
    return (
      <div className="space-y-6">
        <MyVehicleCard />
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar a dashboard</CardTitle>
            <CardDescription>Não foi possível buscar o resumo inicial da home no momento.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const tabs = [
    {
      key: "police-officers",
      label: "Policiais",
      visible: policePermissions.canViewAny && Boolean(home.police_officers),
      content: home.police_officers ? (
        <div className="space-y-4">
          <SummaryGrid
            title="Policiais"
            description="Resumo de efetivo, afastamentos e férias em andamento."
            icon={Shield}
            href="/police-officer-reports"
            items={[
              { label: "Cadastrados", value: home.police_officers.summary.total_registered },
              { label: "Ativos", value: home.police_officers.summary.active },
              { label: "Afastados", value: home.police_officers.summary.on_leave },
              { label: "COPEM pendente", value: home.police_officers.summary.pending_copem },
            ]}
          />
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Efetivo por setor</CardTitle>
                <CardDescription>Leitura rápida da distribuição do efetivo na subunidade ativa.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {home.police_officers.by_sector.slice(0, 6).map((item, index) => (
                  <div key={`${item.sector?.id ?? index}-${item.sector?.name ?? "Sem setor"}`} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{item.sector?.abbreviation || item.sector?.name || "Sem setor"}</p>
                      <p className="text-sm text-slate-500">{formatNumber(item.active_police_officers)} ativos</p>
                    </div>
                    <Badge variant="outline">{formatNumber(item.total_police_officers)}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Distribuição por graduação</CardTitle>
                <CardDescription>As graduações mais presentes no efetivo atual.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {home.police_officers.rank_distribution.slice(0, 6).map((item, index) => (
                  <div key={`${item.rank?.id ?? index}-${item.rank?.name ?? "Sem graduação"}`} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{item.rank?.abbreviation || item.rank?.name || "Sem graduação"}</p>
                      <p className="text-sm text-slate-500">{formatNumber(item.active_police_officers)} ativos</p>
                    </div>
                    <Badge variant="outline">{formatNumber(item.total_police_officers)}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null,
    },
    {
      key: "vehicles",
      label: "Veículos",
      visible: vehiclePermissions.canViewAny && Boolean(home.vehicles),
      content: home.vehicles ? (
        <div className="space-y-4">
          <SummaryGrid
            title="Veículos"
            description="Disponibilidade, uso e vínculos operacionais da frota."
            icon={CarFront}
            href="/vehicle-reports"
            items={[
              { label: "Cadastrados", value: home.vehicles.summary.total_registered },
              { label: "Disponíveis", value: home.vehicles.summary.available },
              { label: "Em uso", value: home.vehicles.summary.in_use },
              { label: "Manutenção", value: home.vehicles.summary.maintenance },
            ]}
          />
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Status da frota</CardTitle>
                <CardDescription>Combinação de status operacional com tipo de posse.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {home.vehicles.fleet_status.slice(0, 6).map((item, index) => (
                  <div key={`${item.status.operational_status}-${item.status.ownership_type}-${index}`} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{item.status.operational_status_label}</p>
                      <Badge variant="outline">{formatNumber(item.total_vehicles)}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{item.status.ownership_type_label} • {formatNumber(item.travel_ready_vehicles)} aptos para viagem</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Composição da frota</CardTitle>
                <CardDescription>Tipos e variantes mais presentes no contexto atual.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {home.vehicles.fleet_composition.slice(0, 6).map((item, index) => (
                  <div key={`${item.type?.id ?? index}-${item.variant?.id ?? index}`} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{item.type?.name || "Sem tipo"} • {item.variant?.name || "Sem variante"}</p>
                      <Badge variant="outline">{formatNumber(item.total_vehicles)}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{formatNumber(item.owned_vehicles)} próprios • {formatNumber(item.rented_vehicles)} locados</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null,
    },
    {
      key: "armaments",
      label: "Armamentos",
      visible: armamentPermissions.canViewAny && Boolean(home.armaments),
      content: home.armaments ? (
        <div className="space-y-4">
          <SummaryGrid
            title="Armamentos"
            description="Disponibilidade, empréstimos e criticidade operacional do arsenal."
            icon={Crosshair}
            href="/armament-reports"
            items={[
              { label: "Cadastrados", value: home.armaments.summary.total_registered },
              { label: "Unidades", value: home.armaments.summary.total_units },
              { label: "Disponíveis", value: home.armaments.summary.available_units },
              { label: "Ocorrências críticas", value: home.armaments.summary.critical_occurrences },
            ]}
          />
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Disponibilidade</CardTitle>
                <CardDescription>Distribuição das unidades por status operacional.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {home.armaments.availability.slice(0, 6).map((item) => (
                  <div key={item.status} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      <p className="font-medium text-slate-900">{item.label}</p>
                    </div>
                    <Badge variant="outline">{formatNumber(item.total_units)}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Inventário</CardTitle>
                <CardDescription>Armamentos com maior volume de unidades disponíveis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {home.armaments.inventory.slice(0, 6).map((item) => (
                  <div key={item.armament.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{formatArmamentLabel(item.armament)}</p>
                      <Badge variant="outline">{formatNumber(item.total_units)}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{formatNumber(item.available_units)} disponíveis • {formatNumber(item.loaned_units)} emprestadas</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-slate-200/70 bg-white/80 xl:col-span-2">
              <CardHeader>
                <CardTitle>Armamentos perto de vencer</CardTitle>
                <CardDescription>Unidades com vencimento próximo dentro da janela de 30 dias.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {!home.armaments.expiring_units.length ? (
                  <p className="text-sm text-slate-500">Nenhuma unidade próxima do vencimento no momento.</p>
                ) : (
                  home.armaments.expiring_units.slice(0, 8).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{formatArmamentLabel(item.armament ?? {})}</p>
                          <p className="text-sm text-slate-500">Série: {item.serial_number || "-"}</p>
                        </div>
                        <Badge variant="warning">{item.days_until_expiration ?? 0} dias</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        Validade: {formatDateTime(item.expiration_date)} • Status: {item.status?.label || "-"} • Subunidade: {item.armament?.subunit?.abbreviation || item.armament?.subunit?.name || "-"}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null,
    },
    {
      key: "contracts",
      label: "Contratos",
      visible: contractPermissions.canViewAny && Boolean(home.contracts),
      content: home.contracts ? (
        <div className="space-y-4">
          <SummaryGrid
            title="Contratos"
            description="Execução, vigência e alertas críticos do contexto contratual ativo."
            icon={FileText}
            href="/contract-reports"
            items={[
              { label: "Cadastrados", value: home.contracts.summary.total_registered },
              { label: "Ativos", value: home.contracts.summary.active },
              { label: "A vencer", value: home.contracts.summary.expiring_30_days },
              { label: "Alertas críticos", value: home.contracts.summary.critical_alerts },
            ]}
          />
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Status dos contratos</CardTitle>
                <CardDescription>Distribuição contratual por status no contexto ativo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {home.contracts.status_overview.slice(0, 6).map((item) => (
                  <div key={item.status.value} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{item.status.label}</p>
                      <p className="text-sm text-slate-500">{formatCurrency(item.executed_amount)} executado</p>
                    </div>
                    <Badge variant={getContractStatusBadgeVariant(item.status.value)}>{formatNumber(item.total_contracts)}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Execução por empresa</CardTitle>
                <CardDescription>Maiores volumes de execução financeira por empresa.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {home.contracts.execution_overview.slice(0, 6).map((item, index) => (
                  <div key={`${item.company.id ?? index}-${item.company.name}`} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{item.company.name}</p>
                      <Badge variant="outline">{formatPercent(item.executed_percentage)}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{formatCurrency(item.executed_amount)} executado • {formatCurrency(item.remaining_amount)} restante</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Contratos a vencer</CardTitle>
                <CardDescription>Contratos ativos com vencimento próximo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {home.contracts.expiring_contracts.slice(0, 6).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{item.contract_number}</p>
                      <Badge variant={getContractStatusBadgeVariant(item.status?.value ?? "closed")}>{item.days_until_end ?? 0} dias</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{item.company || "Sem empresa"} • {formatPercent(item.executed_percentage)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Alertas críticos</CardTitle>
                <CardDescription>Alertas contratuais mais sensíveis para acompanhamento imediato.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {home.contracts.critical_alerts.slice(0, 6).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{item.contract?.contract_number || "Contrato"}</p>
                      <Badge variant={getContractAlertBadgeVariant(item.type?.color)}>{item.type?.label || "Alerta"}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{item.contract?.company || "Sem empresa"} • {formatDateTime(item.alert_date)}</p>
                    <p className="mt-2 text-sm text-slate-600">{item.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null,
    },
  ].filter((section) => section.visible);

  const visibleTabs = tabs;
  const currentTab = visibleTabs.some((tab) => tab.key === activeTab) ? activeTab : (visibleTabs[0]?.key ?? "");

  return (
    <div className="space-y-6">
      <MyVehicleCard />
      <section className="hidden overflow-hidden rounded-[24px] border border-slate-200/70 bg-slate-950 text-white md:block">
        <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-200">
              Dashboard operacional
            </span>
            <div className="space-y-3">
              <h1 className="font-display text-3xl leading-tight md:text-4xl">
                Panorama inicial da subunidade para policiais, veículos e armamentos.
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 md:text-base">
                Assim que você entra, a home já resume o contexto ativo e mostra os indicadores mais úteis das frentes operacionais liberadas para o seu perfil.
              </p>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">Resumo da atualização</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-100">
              <li>Subunidade ativa: {activeSubunit.name}</li>
              <li>Abas visíveis: {visibleTabs.length}</li>
              <li>Gerado em: {formatDateTime(home.generated_at)}</li>
              <li>Dados respeitando permissões e contexto atual.</li>
            </ul>
          </div>
        </div>
      </section>

      {!visibleTabs.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum painel disponível</CardTitle>
            <CardDescription>Seu perfil não possui acesso às frentes retornadas pela home para a subunidade ativa.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Tabs value={currentTab} onValueChange={setActiveTab}>
          <TabsList>
            {visibleTabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {visibleTabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
