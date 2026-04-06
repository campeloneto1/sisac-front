"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Award, Calendar, FileText, Medal, User, UserCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerRank } from "@/hooks/use-police-officer-ranks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { promotionTypeLabels, promotionTypeDescriptions } from "@/types/police-officer-rank.type";

export function PoliceOfficerRankShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("police-officer-ranks");
  const policeOfficerRankQuery = usePoliceOfficerRank(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `view` para visualizar promoções.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (policeOfficerRankQuery.isLoading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  if (policeOfficerRankQuery.isError || !policeOfficerRankQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar promoção</CardTitle>
          <CardDescription>Os dados da promoção não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const policeOfficerRank = policeOfficerRankQuery.data.data;

  function formatDate(dateString: string | null | undefined) {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-display text-3xl text-slate-900">
              {policeOfficerRank.rank?.name ?? "Graduação"}
            </h1>
            {policeOfficerRank.is_current ? (
              <Badge variant="default">Atual</Badge>
            ) : (
              <Badge variant="outline">Encerrada</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Policial: <span className="font-medium">{policeOfficerRank.police_officer?.name ?? "—"}</span>
            {policeOfficerRank.police_officer?.registration_number ? (
              <span className="text-slate-500"> (Mat. {policeOfficerRank.police_officer.registration_number})</span>
            ) : null}
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/police-officer-ranks/${policeOfficerRank.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Informações da graduação</CardTitle>
            <CardDescription>Dados do período e graduação do policial.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <User className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Policial</p>
                <p className="text-sm text-slate-700">
                  {policeOfficerRank.police_officer?.name ?? "—"}
                </p>
                {policeOfficerRank.police_officer?.registration_number ? (
                  <p className="text-xs text-slate-500">Mat. {policeOfficerRank.police_officer.registration_number}</p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Award className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Graduação</p>
                <p className="text-sm text-slate-700">{policeOfficerRank.rank?.name ?? "—"}</p>
                {policeOfficerRank.rank?.abbreviation ? (
                  <p className="text-xs text-slate-500">{policeOfficerRank.rank.abbreviation}</p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Data de início</p>
                <p className="text-sm text-slate-700">{formatDate(policeOfficerRank.start_date)}</p>
              </div>
            </div>

            {policeOfficerRank.end_date ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <Calendar className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Data de término</p>
                  <p className="text-sm text-slate-700">{formatDate(policeOfficerRank.end_date)}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Informações da promoção</CardTitle>
            <CardDescription>Detalhes sobre o processo de promoção.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {policeOfficerRank.promotion_type ? (
              <>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <Medal className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tipo de promoção</p>
                    <p className="text-sm font-medium text-slate-700">
                      {promotionTypeLabels[policeOfficerRank.promotion_type]}
                    </p>
                    <p className="text-xs text-slate-500">
                      {promotionTypeDescriptions[policeOfficerRank.promotion_type]}
                    </p>
                  </div>
                </div>

                {policeOfficerRank.promotion_date ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Data da promoção</p>
                      <p className="text-sm text-slate-700">{formatDate(policeOfficerRank.promotion_date)}</p>
                    </div>
                  </div>
                ) : null}

                {policeOfficerRank.promotion_bulletin ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Boletim/Portaria</p>
                      <p className="text-sm text-slate-700">{policeOfficerRank.promotion_bulletin}</p>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3">
                <p className="text-sm text-slate-600">
                  Nenhuma informação de promoção registrada.
                </p>
              </div>
            )}

            {policeOfficerRank.notes ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">Observações</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{policeOfficerRank.notes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Auditoria</CardTitle>
          <CardDescription>Informações de criação e atualização do registro.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
            <UserCircle2 className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
              <p className="text-sm text-slate-700">
                {policeOfficerRank.creator ? `${policeOfficerRank.creator.name} (${policeOfficerRank.creator.email})` : "Não informado"}
              </p>
              {policeOfficerRank.created_at ? (
                <p className="text-xs text-slate-500">{formatDate(policeOfficerRank.created_at)}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
            <UserCircle2 className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
              <p className="text-sm text-slate-700">
                {policeOfficerRank.updater ? `${policeOfficerRank.updater.name} (${policeOfficerRank.updater.email})` : "Não informado"}
              </p>
              {policeOfficerRank.updated_at ? (
                <p className="text-xs text-slate-500">{formatDate(policeOfficerRank.updated_at)}</p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
