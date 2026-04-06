"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BadgeInfo, CreditCard, GraduationCap, Mail, MapPin, Phone, ShieldCheck, UserCircle2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficer } from "@/hooks/use-police-officers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PoliceOfficerAllocationsSection } from "@/components/police-officers/allocations-section";

export function PoliceOfficerShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("police-officers");
  const policeOfficerQuery = usePoliceOfficer(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `view` para visualizar policiais.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (policeOfficerQuery.isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  if (policeOfficerQuery.isError || !policeOfficerQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar policial</CardTitle>
          <CardDescription>Os dados do policial nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const policeOfficer = policeOfficerQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">{policeOfficer.name ?? policeOfficer.user?.name ?? "Sem nome"}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Nome de guerra: {policeOfficer.war_name} • Matricula: {policeOfficer.registration_number}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Registro funcional completo do policial, incluindo dados civis, identificacao militar, escolaridade e historico de graduacoes.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/police-officers/${policeOfficer.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Resumo rapido do policial.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Graduacao atual</p>
                <p className="text-sm text-slate-700">
                  {policeOfficer.current_rank ? `${policeOfficer.current_rank.name} (${policeOfficer.current_rank.abbreviation ?? "-"})` : "Nao informada"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <GraduationCap className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Escolaridade</p>
                <p className="text-sm text-slate-700">{policeOfficer.education_level?.name ?? "Nao informada"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <BadgeInfo className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
                <p className="text-sm text-slate-700">{policeOfficer.is_active ? "Ativo" : "Inativo"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">
                  {policeOfficer.creator ? `${policeOfficer.creator.name} (${policeOfficer.creator.email})` : "Nao informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Dados pessoais e funcionais</CardTitle>
            <CardDescription>Informacoes retornadas pelo `PoliceOfficerResource`.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">CPF</p>
              <p className="mt-1 text-sm text-slate-700">{policeOfficer.cpf ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Numeral</p>
              <p className="mt-1 text-sm text-slate-700">{policeOfficer.badge_number ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Mail className="mb-2 h-4 w-4 text-primary" />
              <p className="text-sm text-slate-700">{policeOfficer.email ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Phone className="mb-2 h-4 w-4 text-primary" />
              <p className="text-sm text-slate-700">{policeOfficer.phone ?? policeOfficer.phone2 ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <MapPin className="mb-2 h-4 w-4 text-primary" />
              <p className="text-sm text-slate-700">
                {[policeOfficer.street, policeOfficer.number, policeOfficer.neighborhood].filter(Boolean).join(", ") || "Nao informado"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CreditCard className="mb-2 h-4 w-4 text-primary" />
              <p className="text-sm text-slate-700">
                {policeOfficer.bank ? `${policeOfficer.bank.name} • Ag ${policeOfficer.agency ?? "-"} • Cc ${policeOfficer.account ?? "-"}` : "Nao informado"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Historico de graduacoes</CardTitle>
          <CardDescription>Dados carregados em `rank_history` no endpoint de detalhe.</CardDescription>
        </CardHeader>
        <CardContent>
          {policeOfficer.rank_history?.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {policeOfficer.rank_history.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-medium text-slate-900">
                    {item.rank ? `${item.rank.name} (${item.rank.abbreviation ?? "-"})` : "Graduacao nao informada"}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Inicio: {item.start_date ?? "-"} • Fim: {item.end_date ?? "Atual"}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{item.is_current ? "Atual" : "Historico"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhum registro de graduacao encontrado para este policial.</p>
          )}
        </CardContent>
      </Card>

      <PoliceOfficerAllocationsSection
        policeOfficerId={policeOfficer.id}
        policeOfficerName={policeOfficer.name ?? policeOfficer.user?.name ?? policeOfficer.war_name}
      />
    </div>
  );
}
