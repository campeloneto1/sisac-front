"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  CarFront,
  MapPin,
  Receipt,
  User2,
} from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleDamage } from "@/hooks/use-vehicle-damages";
import { formatBrazilianDate } from "@/lib/date-formatter";
import {
  getVehicleDamageContextLabel,
  getVehicleDamageSeverityVariant,
  getVehicleDamageStatusVariant,
} from "@/types/vehicle-damage.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(date?: string | null) {
  return date ? formatBrazilianDate(date) : "Não informado";
}

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function VehicleDamageShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicle-damages");
  const damageQuery = useVehicleDamage(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `view` para visualizar danos de veículos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (damageQuery.isLoading) {
    return <Skeleton className="h-[860px] w-full" />;
  }

  if (damageQuery.isError || !damageQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar dano</CardTitle>
          <CardDescription>
            Os dados do dano não estão disponíveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const damage = damageQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {damage.vehicle?.license_plate ?? `Dano #${damage.id}`}
            </h1>
            <Badge variant={getVehicleDamageSeverityVariant(damage.severity)}>
              {damage.severity_label ?? "Sem gravidade"}
            </Badge>
            <Badge variant={getVehicleDamageStatusVariant(damage.status)}>
              {damage.status_label ?? "Sem status"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {damage.damage_type_label ?? damage.damage_type} •{" "}
            {getVehicleDamageContextLabel(damage)}
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/vehicle-damages/${damage.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Veículo e contexto</CardTitle>
            <CardDescription>
              Identificação do veículo e do evento operacional associado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CarFront className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Veículo
                </p>
                <p className="text-sm text-slate-700">
                  {damage.vehicle?.license_plate ?? `#${damage.vehicle_id}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Contexto
                </p>
                <p className="text-sm text-slate-700">
                  {getVehicleDamageContextLabel(damage)} #{damage.damageable_id ?? "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Local do dano
                </p>
                <p className="text-sm text-slate-700">{damage.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Deteccao</CardTitle>
            <CardDescription>
              Quando e como o dano foi identificado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Data
                </p>
                <p className="text-sm text-slate-700">
                  {formatDate(damage.detected_date)}
                  {damage.detected_time ? ` • ${damage.detected_time}` : ""}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Momento
                </p>
                <p className="text-sm text-slate-700">
                  {damage.detection_moment_label ?? "Não informado"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Descrição
              </p>
              <p className="mt-1 text-sm text-slate-700">{damage.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Responsabilidade e reparo</CardTitle>
            <CardDescription>
              Responsável identificado e andamento do reparo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <User2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Responsável interno
                </p>
                <p className="text-sm text-slate-700">
                  {damage.responsible_user?.name ?? "Não informado"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Responsável externo
              </p>
              <p className="text-sm text-slate-700">
                {damage.responsible_external_name ?? "Não informado"}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Data do reparo
                </p>
                <p className="text-sm text-slate-700">
                  {formatDate(damage.repair_date)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Custos e anexos</CardTitle>
            <CardDescription>
              Estimativas, custos reais e evidencias associadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <Receipt className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Custo estimado
                  </p>
                  <p className="text-sm text-slate-700">
                    {formatCurrency(damage.estimated_repair_cost)}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Custo real
                </p>
                <p className="text-sm text-slate-700">
                  {formatCurrency(damage.actual_repair_cost)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Fotos
              </p>
              {damage.photos?.length ? (
                <div className="mt-2 space-y-2">
                  {damage.photos.map((photo, index) => (
                    <p key={`${photo}-${index}`} className="text-sm text-slate-700">
                      {photo}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-700">
                  Nenhuma foto retornada pela API.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Uploads
              </p>
              {damage.uploads?.length ? (
                <div className="mt-2 space-y-2">
                  {damage.uploads.map((upload) => (
                    <p key={upload.id} className="text-sm text-slate-700">
                      {upload.original_name ??
                        upload.file_name ??
                        `Arquivo #${upload.id}`}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-700">
                  Nenhum upload retornado pela API.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Observações
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {damage.notes ?? "Nenhuma observação informada."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
